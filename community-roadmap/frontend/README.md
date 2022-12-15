# Community Roadmap for Zendesk Help Center

This folder contains the frontend for the Zendesk community roadmap project.
The frontend is built with npm and React.

## Development

The service can be run locally using `npm`.

Run:
```
npm start
```

## Build

Build a distributable script using

```
npm run build
```

## Help Center deployment

Create a custom page and add this content to it:

```
<div class="container">
  <div class="roadmapContainer" data-product-key="guide"></div>
</div>
<script src="{link to script URL}"></script>
```