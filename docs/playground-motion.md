# Playground flip and drag preview

In the Cards tab, “Give it a spin” combines the current court collection and suit with the Classic card back. Click or tap to flip, drag sideways to turn the card directly, or use a short flick to finish the turn with release momentum. Hover adds gentle tilt and glare. Enter and Space flip the focused card, and the adjacent Show face/Show back button offers another control.

The device's reduced-motion preference disables drag rotation, hover movement, and animated transitions while retaining instant face changes and keyboard operation. The hidden face is inert and hidden from assistive technology. Focus is visible. Vertical touch scrolling remains available.

The source is the exact React Bits `FlipCard-JS-CSS` registry item, adapted to strict TypeScript and the existing playground styling. Motion is an application-only dependency. The MIT + Commons Clause notice is retained beside the component; neither this code nor Motion is included in the MIT FeltForge npm library.

Remote CI covers click, keyboard and external controls; hover tilt; positional drag and spring settling; velocity-driven flicks; and reduced-motion behavior on a 390px viewport. Local checks cover lint, type safety, build and the existing library tests. Browser control stays outside the user's local session.
