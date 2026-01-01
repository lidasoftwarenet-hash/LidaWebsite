# System Graph Visualizer - Feature Implementation Plan

## 🎯 Overview
This document outlines the detailed implementation plan for 5 major features that will transform the System Graph Visualizer into a must-have tool for tech professionals.

---

## Feature 1: Export as Image/SVG 📸

### Priority: HIGH | Complexity: LOW | Time: 2-3 hours

### Description
Allow users to export their graphs as high-quality images (PNG, SVG) for documentation, presentations, and sharing.

### Technical Implementation

#### 1.1 Dependencies
```javascript
// Add to HTML head or use CDN
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

#### 1.2 UI Changes
**Add to header actions:**
```html
<button class="icon-btn" id="exportImageBtn">📸 Export Image</button>
```

**Add export modal:**
```html
<div id="exportModal" class="modal hidden">
  <div class="modal-content">
    <h3>Export Graph</h3>
    <div class="export-options">
      <button onclick="exportAsPNG()">PNG (Raster)</button>
      <button onclick="exportAsSVG()">SVG (Vector)</button>
      <button onclick="exportAsPDF()">PDF (Document)</button>
    </div>
    <div class="export-settings">
      <label>
        <input type="checkbox" id="includeBackground" checked>
        Include background
      </label>
      <label>
        <input type="checkbox" id="transparentBg">
        Transparent background
      </label>
      <label>
        Scale: <input type="range" id="exportScale" min="1" max="4" value="2">
        <span id="scaleValue">2x</span>
      </label>
    </div>
  </div>
</div>
```

#### 1.3 JavaScript Functions

```javascript
// Export as PNG
async function exportAsPNG() {
  const graphArea = document.querySelector('.canvas-wrapper');
  const scale = document.getElementById('exportScale').value;
  const transparent = document.getElementById('transparentBg').checked;
  
  const canvas = await html2canvas(graphArea, {
    scale: scale,
    backgroundColor: transparent ? null : '#0a0e1a',
    logging: false,
    useCORS: true
  });
  
  const link = document.createElement('a');
  link.download = `system-graph-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Export as SVG
function exportAsSVG() {
  const svg = document.querySelector('.canvas-wrapper svg').cloneNode(true);
  const nodes = document.querySelectorAll('.node');
  
  // Convert HTML nodes to SVG foreignObject
  nodes.forEach(node => {
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', node.style.left);
    foreignObject.setAttribute('y', node.style.top);
    foreignObject.setAttribute('width', node.offsetWidth);
    foreignObject.setAttribute('height', node.offsetHeight);
    foreignObject.innerHTML = node.outerHTML;
    svg.appendChild(foreignObject);
  });
  
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `system-graph-${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Export as PDF (using jsPDF)
async function exportAsPDF() {
  const { jsPDF } = window.jspdf;
  const canvas = await html2canvas(document.querySelector('.canvas-wrapper'));
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`system-graph-${Date.now()}.pdf`);
}
```

#### 1.4 CSS Additions
```css
.export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.export-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 20, 37, 0.6);
  border-radius: 12px;
}
```

### Testing Checklist
- [ ] PNG export works with transparent background
- [ ] SVG export preserves all styling
- [ ] PDF export maintains quality
- [ ] Large graphs export without memory issues
- [ ] Export works on mobile devices

---

## Feature 2: Templates Library 📚

### Priority: HIGH | Complexity: LOW | Time: 3-4 hours

### Description
Pre-built architecture templates that users can load instantly to visualize common patterns.

### Technical Implementation

#### 2.1 Template Data Structure
```javascript
const TEMPLATES = {
  microservices: {
    name: "Microservices Architecture",
    description: "Modern cloud-native microservices pattern",
    icon: "🏗️",
    tags: ["cloud", "scalable", "distributed"],
    data: {
      project: { name: "Microservices Platform", type: "microservices" },
      nodes: [
        { id: "api-gateway", label: "API Gateway", type: "gateway", technology: "Kong/Nginx" },
        { id: "auth-service", label: "Auth Service", type: "service", technology: "OAuth2/JWT" },
        { id: "user-service", label: "User Service", type: "service", technology: "Node.js" },
        { id: "order-service", label: "Order Service", type: "service", technology: "Go" },
        { id: "payment-service", label: "Payment Service", type: "service", technology: "Java" },
        { id: "notification-service", label: "Notification Service", type: "service", technology: "Python" },
        { id: "postgres", label: "PostgreSQL", type: "database" },
        { id: "mongodb", label: "MongoDB", type: "database" },
        { id: "redis", label: "Redis Cache", type: "cache" },
        { id: "rabbitmq", label: "RabbitMQ", type: "queue" },
        { id: "elasticsearch", label: "Elasticsearch", type: "database" }
      ],
      edges: [
        { from: "api-gateway", to: "auth-service", type: "grpc" },
        { from: "api-gateway", to: "user-service", type: "grpc" },
        { from: "api-gateway", to: "order-service", type: "grpc" },
        { from: "order-service", to: "payment-service", type: "rest" },
        { from: "order-service", to: "rabbitmq", type: "queue" },
        { from: "notification-service", to: "rabbitmq", type: "queue" },
        { from: "user-service", to: "postgres", type: "database" },
        { from: "order-service", to: "postgres", type: "database" },
        { from: "auth-service", to: "redis", type: "cache" },
        { from: "notification-service", to: "mongodb", type: "database" }
      ]
    }
  },
  
  serverless: {
    name: "Serverless Architecture",
    description: "Event-driven serverless pattern with AWS Lambda",
    icon: "⚡",
    tags: ["serverless", "aws", "event-driven"],
    data: {
      project: { name: "Serverless App", type: "serverless" },
      nodes: [
        { id: "api-gateway", label: "API Gateway", type: "gateway", technology: "AWS API Gateway" },
        { id: "lambda-auth", label: "Auth Function", type: "backend", technology: "Lambda" },
        { id: "lambda-users", label: "Users Function", type: "backend", technology: "Lambda" },
        { id: "lambda-orders", label: "Orders Function", type: "backend", technology: "Lambda" },
        { id: "dynamodb", label: "DynamoDB", type: "database", technology: "NoSQL" },
        { id: "s3", label: "S3 Storage", type: "database", technology: "Object Storage" },
        { id: "sqs", label: "SQS Queue", type: "queue", technology: "AWS SQS" },
        { id: "sns", label: "SNS Topics", type: "queue", technology: "AWS SNS" },
        { id: "cloudfront", label: "CloudFront CDN", type: "infra", technology: "CDN" }
      ],
      edges: [
        { from: "cloudfront", to: "api-gateway", type: "rest" },
        { from: "api-gateway", to: "lambda-auth", type: "invoke" },
        { from: "api-gateway", to: "lambda-users", type: "invoke" },
        { from: "api-gateway", to: "lambda-orders", type: "invoke" },
        { from: "lambda-users", to: "dynamodb", type: "database" },
        { from: "lambda-orders", to: "dynamodb", type: "database" },
        { from: "lambda-orders", to: "sqs", type: "queue" },
        { from: "lambda-orders", to: "sns", type: "publish" },
        { from: "cloudfront", to: "s3", type: "storage" }
      ]
    }
  },
  
  monolith: {
    name: "Monolithic Architecture",
    description: "Traditional three-tier monolithic application",
    icon: "🏛️",
    tags: ["traditional", "simple", "monolith"],
    data: {
      project: { name: "Monolithic App", type: "monolith" },
      nodes: [
        { id: "load-balancer", label: "Load Balancer", type: "infra", technology: "Nginx" },
        { id: "web-server-1", label: "Web Server 1", type: "backend", technology: "Node.js" },
        { id: "web-server-2", label: "Web Server 2", type: "backend", technology: "Node.js" },
        { id: "postgres", label: "PostgreSQL", type: "database", technology: "SQL" },
        { id: "redis", label: "Redis Cache", type: "cache", technology: "In-Memory" },
        { id: "cdn", label: "CDN", type: "infra", technology: "CloudFlare" }
      ],
      edges: [
        { from: "cdn", to: "load-balancer", type: "rest" },
        { from: "load-balancer", to: "web-server-1", type: "rest" },
        { from: "load-balancer", to: "web-server-2", type: "rest" },
        { from: "web-server-1", to: "postgres", type: "database" },
        { from: "web-server-2", to: "postgres", type: "database" },
        { from: "web-server-1", to: "redis", type: "cache" },
        { from: "web-server-2", to: "redis", type: "cache" }
      ]
    }
  },
  
  eventDriven: {
    name: "Event-Driven Architecture",
    description: "CQRS and Event Sourcing pattern",
    icon: "🔄",
    tags: ["event-sourcing", "cqrs", "scalable"],
    data: {
      project: { name: "Event-Driven System", type: "event-driven" },
      nodes: [
        { id: "api", label: "Command API", type: "backend", technology: "REST API" },
        { id: "command-handler", label: "Command Handler", type: "service", technology: "Event Handler" },
        { id: "event-store", label: "Event Store", type: "database", technology: "EventStoreDB" },
        { id: "event-bus", label: "Event Bus", type: "queue", technology: "Kafka" },
        { id: "read-model-1", label: "Read Model 1", type: "service", technology: "Projection" },
        { id: "read-model-2", label: "Read Model 2", type: "service", technology: "Projection" },
