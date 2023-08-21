import React from 'react';
import ReactDOM from 'react-dom/client';
import RoadmapApp from './RoadmapApp';
import '@zendeskgarden/css-bedrock';

const roadmapElements = document.getElementsByClassName("roadmapContainer");

console.log("Initiating Zendesk Community Roadmap - " + roadmapElements.length + " products identified")

for (let i = 0; i < roadmapElements.length; i++) {
  const roadmapElement = roadmapElements[i];
  const productKey = roadmapElement.dataset.productKey;
  const backendBaseUrl = roadmapElement.dataset.backendBaseUrl;
  if (backendBaseUrl === undefined) {
    console.log("No data-backend-base-url value provided for roadmap '" + productKey + "'. Skipping.")
    continue;
  }
  const tokenEndpointUrl = roadmapElement.dataset.tokenEndpointUrl || "/api/v2/help_center/integration/token";
  console.log("Rendering product '" + productKey + "' from backend " + backendBaseUrl);
  const root = ReactDOM.createRoot(roadmapElement);
  root.render(
    <React.StrictMode>
      <RoadmapApp productKey={productKey} backendBaseUrl={backendBaseUrl} tokenEndpointUrl={tokenEndpointUrl} />
    </React.StrictMode>
  );
}
