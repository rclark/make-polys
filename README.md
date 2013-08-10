# make-polys

Gluing [Leaflet](), [Leaflet.draw]() and [JSTS]() together to support a common workflow for generating geologic maps.

### Problems I noticed
- If you are making really big polygons (approx. the size of a US state), accuracy problems arise. Probably can't do this without paying attention to whether or not we're doing spherical math.