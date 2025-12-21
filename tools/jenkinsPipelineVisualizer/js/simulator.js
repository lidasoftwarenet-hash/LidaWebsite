// js/simulator.js - Dry-run animation and fake logs

function simulate(ast, logsElement) {
  logsElement.innerHTML = '';

  const randomFail = Math.random() < 0.2; // 20% chance of random failure
  let delay = 0;

  function log(message) {
    logsElement.innerHTML += `${new Date().toLocaleTimeString()} > ${message}\n`;
    logsElement.scrollTop = logsElement.scrollHeight;
  }

  function animateStage(stageName, success) {
    // Find stage boxes by text content
    const textElements = document.querySelectorAll('svg text');
    textElements.forEach(text => {
      if (text.textContent === stageName) {
        const rect = text.previousElementSibling;
        if (rect && rect.tagName === 'rect') {
          rect.style.transition = 'fill 0.5s';
          rect.style.fill = success ? '#059669' : '#dc2626'; // Darker green/red
        }
      }
    });
  }

  function generateFakeLogs(stage, success, isParallel = false) {
    const prefix = isParallel ? '  [Parallel] ' : '';
    log(`${prefix}Starting stage: ${stage.name}`);
    
    if (stage.steps) {
      stage.steps.forEach(step => {
        setTimeout(() => {
          log(`${prefix}Executing: ${step}`);
        }, delay);
        delay += 800;
      });
    }
    
    if (stage.parallel) {
      log(`${prefix}Running parallel stages...`);
      stage.parallel.forEach(p => {
        generateFakeLogs(p, success, true);
      });
    }
    
    setTimeout(() => {
      log(`${prefix}Stage ${stage.name} ${success ? '✓ succeeded' : '✗ failed'}`);
      animateStage(stage.name, success);
    }, delay);
    
    delay += 1000;
  }

  // Start simulation
  log('=== Pipeline Execution Started ===');
  log(`Agent: ${ast.agent || 'any'}`);
  
  if (ast.environment) {
    log('Environment variables set');
  }
  
  delay += 500;

  // Process stages
  let failed = false;
  ast.stages.forEach((stage, idx) => {
    const shouldFail = randomFail && idx === Math.floor(ast.stages.length / 2);
    const success = !shouldFail && !failed;
    
    if (failed) {
      setTimeout(() => {
        log(`Skipping stage: ${stage.name} (previous stage failed)`);
      }, delay);
      delay += 500;
    } else {
      generateFakeLogs(stage, success);
      if (shouldFail) {
        failed = true;
      }
    }
  });

  // Post actions
  if (ast.post && ast.post.always) {
    setTimeout(() => {
      log('Running post-build actions...');
      ast.post.always.forEach(action => {
        log(`Post: ${action}`);
      });
    }, delay);
    delay += 1000;
  }

  // Final result
  setTimeout(() => {
    if (failed) {
      log('=== Pipeline FAILED ===');
      showToast('Simulation completed with failures', true);
    } else {
      log('=== Pipeline SUCCESS ===');
      showToast('Simulation completed successfully!');
    }
  }, delay);
}
