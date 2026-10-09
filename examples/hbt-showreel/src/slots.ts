// Product and background image slots.
//
// The Claude Design prototype left most product shots as empty drop zones.
// Put a file in public/slots/ and map its slot id to the path here, e.g.
//   'pk-p10': 'slots/p10-pack.png',
// Products: cut-out PNGs with transparent backgrounds (shown in colour with a cast shadow).
// Backgrounds (bg-*): any photo; rendered black-and-white automatically.
//
// Empty slots render nothing. Set the `showPlaceholders` prop in Studio to see where they sit.
export const SLOTS: Record<string, string | undefined> = {
  // Backgrounds
  'bg-opening': undefined, // B&W expo hall or warehouse photo
  'bg-paint-markers': undefined, // B&W photo: marking steel / fabrication
  'bg-paintstik': 'assets/bg-paintstik.jpg',
  'bg-spray-ink': undefined, // B&W construction / civil site photo
  'bg-protech': undefined, // B&W maintenance workshop photo
  'bg-zinc-guard': undefined, // B&W heavy industry: steel structure / bridge
  'bg-floor': 'assets/bg-floor.jpg',

  // Products (cut-out PNGs)
  'pk-p10': undefined,
  'pk-p20': undefined,
  'pk-paintstik': undefined, // horizontal
  'pk-spraywriter': undefined,
  'pk-sprayink-1': undefined,
  'pk-sprayink-2': undefined,
  'pk-sprayink-3': undefined,
  'pk-protech-1': undefined, // Brake & Parts Cleaner
  'pk-protech-2': undefined, // Multi-Purpose Lubricant
  'pk-protech-3': undefined, // Penetrating Oil
  'pk-protech-4': undefined, // Silicone Lubricant
  'pk-protech-5': undefined, // Contact Cleaner
  'pk-protech-6': undefined, // White Lithium Grease
  'pk-zinc-aerosol': undefined, // Cold Galv aerosol
  'pk-zinc-tin': undefined, // Silver Zinc tin
  'pk-line-marking': undefined,
  'pk-epoxy': undefined, // AutoTech Epoxy Floor Coating 8L
};
