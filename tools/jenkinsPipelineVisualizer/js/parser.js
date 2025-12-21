// js/parser.js - Enhanced Declarative Jenkins Pipeline Parser

function parsePipeline(script) {
  const lines = script.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));
  let i = 0;

  function skipBlock() {
    // Skip a block by counting braces
    let braceCount = 0;
    
    // If current line has opening brace, count it
    if (lines[i].includes('{')) {
      braceCount = 1;
      i++;
    }
    
    while (i < lines.length && braceCount > 0) {
      const line = lines[i];
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      i++;
      if (braceCount === 0) break;
    }
  }

  function parseSteps() {
    const steps = [];
    let inMultiLineString = false;
    let multiLineDelimiter = null;
    let currentStep = '';
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check for end of steps block
      if (!inMultiLineString && line === '}') {
        break;
      }
      
      // Handle multi-line strings (""" or ''')
      if (!inMultiLineString) {
        if (line.includes('"""') || line.includes("'''")) {
          multiLineDelimiter = line.includes('"""') ? '"""' : "'''";
          inMultiLineString = true;
          // Extract the command type (sh, echo, etc.)
          const cmdMatch = line.match(/^(sh|echo|bat)\s+/);
          if (cmdMatch) {
            currentStep = cmdMatch[1] + ' ';
          }
          i++;
          continue;
        }
      } else {
        // We're in a multi-line string
        if (line.includes(multiLineDelimiter)) {
          // End of multi-line string
          inMultiLineString = false;
          multiLineDelimiter = null;
          if (currentStep) {
            steps.push(currentStep.trim());
            currentStep = '';
          }
          i++;
          continue;
        } else {
          // Accumulate the line
          currentStep += line + ' ';
          i++;
          continue;
        }
      }
      
      // Regular step parsing
      if (line.startsWith('sh ') || line.startsWith('echo ') || 
          line.startsWith('bat ') || line.startsWith('git ') ||
          line.startsWith('checkout') || line.startsWith('input ') ||
          line.startsWith('dir(') || line.startsWith('archiveArtifacts') ||
          line.startsWith('junit') || line.startsWith('publishHTML') ||
          line.startsWith('docker ') || line.startsWith('kubectl ') ||
          line.startsWith('npm ') || line.startsWith('mvn ')) {
        
        let step = line.replace(/['"]/g, '').trim();
        // Remove trailing comments
        step = step.replace(/\/\/.*$/, '').trim();
        if (step) {
          steps.push(step);
        }
      }
      
      i++;
    }
    
    return steps;
  }

  function parseBlock(isTopLevel = false) {
    const block = {};
    let loopGuard = 0;
    const maxIterations = lines.length * 3;

    while (i < lines.length) {
      loopGuard++;
      if (loopGuard > maxIterations) {
        console.error('Infinite loop detected at line:', lines[i]);
        throw new Error('Parser infinite loop detected');
      }

      const line = lines[i];

      // End of block
      if (line === '}') {
        i++;
        return block;
      }

      // Agent
      if (line.startsWith('agent')) {
        block.agent = line.includes('any') ? 'any' : 'custom';
        i++;
      }
      // Environment block
      else if (line.startsWith('environment {')) {
        block.environment = {};
        i++;
        while (i < lines.length && lines[i] !== '}') {
          const envLine = lines[i];
          if (envLine.includes('=')) {
            const eqIndex = envLine.indexOf('=');
            const key = envLine.substring(0, eqIndex).trim();
            let value = envLine.substring(eqIndex + 1).trim();
            // Remove quotes and comments
            value = value.replace(/^['"]|['"]$/g, '').replace(/\/\/.*$/, '').trim();
            block.environment[key] = value;
          }
          i++;
        }
        if (lines[i] === '}') i++;
      }
      // Options, triggers, when blocks - skip them
      else if (line.startsWith('options {') || line.startsWith('triggers {')) {
        skipBlock();
      }
      // Stages block
      else if (line.startsWith('stages {')) {
        block.stages = [];
        i++;
      }
      // Post block (top level)
      else if (line.startsWith('post {') && isTopLevel) {
        block.post = { always: [], success: [], failure: [] };
        i++;
        
        while (i < lines.length && lines[i] !== '}') {
          const postLine = lines[i];
          
          if (postLine.startsWith('always {')) {
            i++;
            while (i < lines.length && lines[i] !== '}') {
              const step = lines[i].replace(/['"]/g, '').replace(/\/\/.*$/, '').trim();
              if (step && !step.startsWith('{')) {
                block.post.always.push(step);
              }
              i++;
            }
            if (lines[i] === '}') i++;
          }
          else if (postLine.startsWith('success {')) {
            i++;
            while (i < lines.length && lines[i] !== '}') {
              const step = lines[i].replace(/['"]/g, '').replace(/\/\/.*$/, '').trim();
              if (step && !step.startsWith('{')) {
                block.post.success.push(step);
              }
              i++;
            }
            if (lines[i] === '}') i++;
          }
          else if (postLine.startsWith('failure {')) {
            i++;
            while (i < lines.length && lines[i] !== '}') {
              const step = lines[i].replace(/['"]/g, '').replace(/\/\/.*$/, '').trim();
              if (step && !step.startsWith('{')) {
                block.post.failure.push(step);
              }
              i++;
            }
            if (lines[i] === '}') i++;
          }
          else {
            i++;
          }
        }
        if (lines[i] === '}') i++;
      }
      // Stage definition
      else if (line.includes('stage(')) {
        const stageName = line.match(/stage\(['"](.+?)['"]\)/)?.[1] || 'Unknown';
        i++;
        if (lines[i] === '{') i++;
        
        const stageBlock = { name: stageName };
        
        // Parse stage contents
        while (i < lines.length && lines[i] !== '}') {
          const stageLine = lines[i];
          
          // Skip when blocks
          if (stageLine.startsWith('when {')) {
            skipBlock();
          }
          // Steps block
          else if (stageLine.startsWith('steps {')) {
            i++;
            stageBlock.steps = parseSteps();
            if (lines[i] === '}') i++;
          }
          // Parallel block
          else if (stageLine.startsWith('parallel {')) {
            stageBlock.parallel = [];
            i++;
            
            while (i < lines.length && lines[i] !== '}') {
              if (lines[i].includes('stage(')) {
                const parallelStageName = lines[i].match(/stage\(['"](.+?)['"]\)/)?.[1] || 'Parallel';
                i++;
                if (lines[i] === '{') i++;
                
                const parallelStage = { name: parallelStageName };
                
                while (i < lines.length && lines[i] !== '}') {
                  if (lines[i].startsWith('steps {')) {
                    i++;
                    parallelStage.steps = parseSteps();
                    if (lines[i] === '}') i++;
                  } else if (lines[i].startsWith('post {')) {
                    skipBlock();
                  } else {
                    i++;
                  }
                }
                
                if (lines[i] === '}') i++;
                stageBlock.parallel.push(parallelStage);
              } else {
                i++;
              }
            }
            if (lines[i] === '}') i++;
          }
          // Post block in stage
          else if (stageLine.startsWith('post {')) {
            skipBlock();
          }
          else {
            i++;
          }
        }
        
        if (lines[i] === '}') i++;
        
        if (!block.stages) block.stages = [];
        block.stages.push(stageBlock);
      }
      else {
        i++;
      }
    }

    return block;
  }

  // Start parsing
  if (!lines[i] || !lines[i].startsWith('pipeline {')) {
    throw new Error('Pipeline must start with "pipeline {"');
  }
  i++;

  const ast = parseBlock(true);

  if (!ast.stages || ast.stages.length === 0) {
    throw new Error('No stages found in pipeline');
  }

  return ast;
}
