// js/visualizer.js - Generate SVG flowchart from AST

function visualize(ast) {
  let svgContent = '';
  let y = 50;
  const boxWidth = 240;
  const boxHeight = 50;
  const horizontalGap = 100;
  const verticalGap = 120;

  // Pipeline header (make taller if agent exists)
  const pipelineHeight = ast.agent ? 70 : boxHeight;
  svgContent += `<g transform="translate(400, ${y})" class="pipeline-box">
    <rect x="${-boxWidth/2}" y="0" width="${boxWidth}" height="${pipelineHeight}" rx="15"/>
    <text x="0" y="${pipelineHeight/2 - 5}" class="pipeline-title">Pipeline</text>
    ${ast.agent ? `<text x="0" y="${pipelineHeight/2 + 15}" class="pipeline-subtitle">Agent: ${ast.agent}</text>` : ''}
  </g>`;

  const pipelineY = y;
  y += verticalGap + (ast.agent ? 70 : 50);

  // Stages
  let prevY = pipelineY;
  let prevHeight = pipelineHeight;
  
  ast.stages.forEach((stage, index) => {
    const stageX = 400;
    const stageY = y;

    // Arrow from previous (stop well before the box starts) - ALWAYS draw it
    svgContent += `<line x1="400" y1="${prevY + prevHeight}" x2="400" y2="${y - 25}" class="flow-arrow" marker-end="url(#arrow)"/>`;

    // Stage box with step count
    const stepCount = stage.steps ? stage.steps.length : 0;
    svgContent += `<g transform="translate(${stageX}, ${stageY})" class="stage-box">
      <rect x="${-boxWidth/2}" y="0" width="${boxWidth}" height="${boxHeight}" rx="15"/>
      <text x="0" y="${boxHeight/2 - 5}" class="stage-title">${stage.name}</text>
      ${stepCount > 0 ? `<text x="0" y="${boxHeight/2 + 20}" class="stage-count">${stepCount} step${stepCount > 1 ? 's' : ''}</text>` : ''}
    </g>`;

    prevY = y;
    prevHeight = boxHeight;
    y += boxHeight + 60;

    // Parallel stages if exist
    if (stage.parallel && stage.parallel.length > 0) {
      const parallelCount = stage.parallel.length;
      const totalWidth = parallelCount * boxWidth + (parallelCount - 1) * horizontalGap;
      const startX = 400 - totalWidth / 2 + boxWidth / 2;

      stage.parallel.forEach((pStage, idx) => {
        const px = startX + idx * (boxWidth + horizontalGap);
        const pStepCount = pStage.steps ? pStage.steps.length : 0;
        
        // Arrow from main stage to parallel (stop before parallel box)
        svgContent += `<line x1="${stageX}" y1="${stageY + boxHeight + 10}" x2="${px}" y2="${y - 25}" class="flow-arrow-dashed" marker-end="url(#arrow)"/>`;
        
        svgContent += `<g transform="translate(${px}, ${y})" class="parallel-box">
          <rect x="${-boxWidth/2}" y="0" width="${boxWidth}" height="${boxHeight}" rx="15"/>
          <text x="0" y="${boxHeight/2 - 5}" class="parallel-title">${pStage.name}</text>
          ${pStepCount > 0 ? `<text x="0" y="${boxHeight/2 + 20}" class="parallel-count">${pStepCount} step${pStepCount > 1 ? 's' : ''}</text>` : ''}
        </g>`;
      });

      prevY = y;
      prevHeight = boxHeight;
      y += boxHeight + 80;
    }
  });

  // Post section if exists
  if (ast.post && ast.post.always) {
    // Arrow to post section (stop before post box)
    svgContent += `<line x1="400" y1="${y - 50}" x2="400" y2="${y - 25}" class="flow-arrow" marker-end="url(#arrow)"/>`;
    
    svgContent += `<g transform="translate(400, ${y})" class="post-box">
      <rect x="${-boxWidth/2}" y="0" width="${boxWidth}" height="${boxHeight}" rx="15"/>
      <text x="0" y="${boxHeight/2 + 5}">Post Actions</text>
    </g>`;
    y += boxHeight;
  }

  // Calculate final height with padding
  const finalHeight = y + 50;

  // Build complete SVG with dynamic width and height to accommodate parallel stages
  const svg = `<svg width="100%" viewBox="0 0 1200 ${finalHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="2.5" orient="auto" markerUnits="strokeWidth" class="arrow-marker">
        <path d="M0,0 L0,5 L6,2.5 z" />
      </marker>
    </defs>${svgContent}</svg>`;

  return svg;
}
