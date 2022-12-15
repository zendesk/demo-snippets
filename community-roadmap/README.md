# Community roadmap for a Zendesk help center

This project provides a public roadmap feature in Zendesk Guide, where the product roadmap items are driven by community posts.

Customers can leave feedback and feature requests in a Gather community. The tool creates a publicly visible roadmap. Each item in the roadmap is linked to a Gather community post. Users can vote and comment on the roadmap items by voting and commenting on the linked community post.

![Screenshot of a roadmap created with this tool](screenshot.png "Screenshot")

## Structure

The project defines this structure of a roadmap:

* Product: A roadmap is created for a single product. A product has a set of owners who are the ones who can modify the roadmap.
* Product area: An area of the product that you wish to place roadmap items into.
* Product area item: An individual feature or project that you are considering or planning to do.

The service is built to host multiple products, and thus multiple roadmaps. These are kept fully independent from each other, but you don't need multiple service instances just because you have multiple products.

## Using the service

Once the service is built and deployed, you simply use it by adding an element to your help center theme's HTML code, like this:

```
<div class="container">
	<div class="roadmapContainer" data-product-key="{my_product_key}" data-backend-base-url="{worker_url}"></div>
</div>
<script src="{frontend_script_src}"></script>
```

Replace the following placeholder strings:

* `{my_product_key}`: A unique key for your roadmapped product. For example `guide`
* `{frontend_script_src}`: The URL to the frontend script that you've built and deployed. Typically ending with `/js/main.(version).js`.
* `{worker_url}`: The URL to the running backend service.

There is an example roadmap deployed on this URL: https://z3n-kaspersor.zendesk.com/hc/p/roadmap

## Codebase overview

The project is divided into two major modules:

The [backend](backend/README.md) module is a REST API service built for hosting outside of Zendesk.

The [frontend](frontend/README.md) module is the client of the REST API, built to run inside Zendesk help center, for instance as a custom page.

See the individual module's README files for details on how they work.
