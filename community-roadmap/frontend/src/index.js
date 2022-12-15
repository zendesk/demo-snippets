import React from 'react';
import ReactDOM from 'react-dom/client';
import RoadmapApp from './RoadmapApp';
import '@zendeskgarden/css-bedrock';

const roadmapElements = document.getElementsByClassName("roadmapContainer");

console.log("Initiating Zendesk Community Roadmap - " + roadmapElements.length + " products identified")

for (let i = 0; i < roadmapElements.length; i++) {
  const roadmapElement = roadmapElements[i];
  const productKey = roadmapElement.dataset.productKey;
  const backendBaseUrl = roadmapElement.dataset.backendBaseUrl || "https://community-roadmap.kaspersor.workers.dev";
  const tokenEndpointUrl = roadmapElement.dataset.tokenEndpointUrl || "/hc/api/v2/integration/token";
  console.log("Rendering product '" + productKey + "' from backend " + backendBaseUrl);
  const root = ReactDOM.createRoot(roadmapElement);
  root.render(
    <React.StrictMode>
      <RoadmapApp productKey={productKey} backendBaseUrl={backendBaseUrl} tokenEndpointUrl={tokenEndpointUrl} />
    </React.StrictMode>
  );
}
