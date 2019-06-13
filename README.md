# Shiro Documentation and Guides

## To Run:

Navigate to the root directory of this repo and start a local server (ex: `python -m http.server`). Then, open your browser and navigate to the address of that local server (ex: `localhost:8000`).

## To add new vis carousel images:

1. After exporting open the svg in a text editor. Near the top there should be something like `data:img/png;base64`... change it to `data:image/png;base64` or else it will not render.

2. Put the svg in the `vis/static/svgs/` directory with the rest of the visualizations

3. In the definition for variable `nodes` in `vis/vis-script.js` (it should be an array of JSON objects), find the appropriate node and add the file name (without extensions) to the `carousel` field.

## To change the gifs: 

1. Add the new gif to the `vis/static/` directory. Note: if the new gif has the exact same name/extension and replaces an old one, then you're done.

2. Otherwise, go into the right node definition in `vis/vis-script.js` and change the `gif` field to the correct filename AND extension.

## To change the zoom level:

1. The patterns are defined in `vis/index.html`. Based on the image name that is reference you can identify which pattern you want to change.
2. You'll want to adjust the x, y, width, and height attributes. Those are in fractions of the pattern's size (which is the image size in pixels). Generally, try not to adjust the image resolution or it will look pixelated/not fill up enough space. Example: there's some blank space at the top edge of some patterns so I offset the y and increase the height.

## Misc code documentation:
- To prevent animations from starting before the last one is complete, I use a lock (defined at the top of the file). The acquire/release timing for the lock might need to be changed if transitions/animations are changed.

- The schema for defining nodes is outlined below:
```
    {
        "key": integer, the number of digits is the depth (root is 0, up to 2 digit keys for leaf)
        "parent": integer, the key of the node's parent
        "id": string, a unique identifier
        "url": string, the id but escaped so that it can be used in a URL
        "brush": string, the color of the node
        "background": string, the color of the background when the node is focused
        "vback": string, the color of the background behind the patterns (only for depth 1 nodes)
        "txtcolor": string, color of the text associated with that node
        "vpattern": string, the name of the pattern to display (ex: heartback, only for depth 1 nodes)
        "gif": string, the name of the gif to display when focused on the node (doesn't need to be a gif, only for depth 1 nodes)
        "logo": string, the file name for the logo to display at the middle of the node (only for depth 0 node)
        "carousel": string list, a list of the names of the visualizations to display in the carousel. clicking into the carousel will always load the first item in the list
    }
```
- the code is set up so that there are 2 main handlers for clicks (nodeClick and backgroundClick)

- the drawing and clearing of additional elements is done by helper functions

- the carousel is maintained separately, should be somewhat self-explanatory

- there's a large section to handle repositioning the nodes when zoomed in. different node depths are handled differently; best not to mess with the math on that. The variables named `k` or `m` are additional scaling factors for positioning, and `dx` and `dy` are offsets. Those can be adjusted at the call sites if you want to tweak positioning.

- `voronoi` refers to the voronoi layout of the patterned background

- different elements are drawn in different layers (svg `g` elements) - things that need to zoom should be appended to the zoomable layer

- changing the arguments for `getBlobPath` can adjust the shape of the nodes 





