/* ------------------------------------------------------------------
   GD&T Interview Test — question bank
   Symbols follow ASME Y14.5-2018. Every question carries a short
   explanation so the test doubles as a study tool.
------------------------------------------------------------------- */

const SYMBOLS = {
  "dia": '<svg class="sym" aria-hidden="true"><use href="#s-dia"/></svg>',
  "position": '<svg class="sym" aria-hidden="true"><use href="#s-position"/></svg>',
  "straightness": '<svg class="sym" aria-hidden="true"><use href="#s-straightness"/></svg>',
  "flatness": '<svg class="sym" aria-hidden="true"><use href="#s-flatness"/></svg>',
  "circularity": '<svg class="sym" aria-hidden="true"><use href="#s-circularity"/></svg>',
  "cylindricity": '<svg class="sym" aria-hidden="true"><use href="#s-cylindricity"/></svg>',
  "perpendicularity": '<svg class="sym" aria-hidden="true"><use href="#s-perpendicularity"/></svg>',
  "parallelism": '<svg class="sym" aria-hidden="true"><use href="#s-parallelism"/></svg>',
  "angularity": '<svg class="sym" aria-hidden="true"><use href="#s-angularity"/></svg>',
  "profile-surface": '<svg class="sym" aria-hidden="true"><use href="#s-profile-surface"/></svg>',
  "profile-line": '<svg class="sym" aria-hidden="true"><use href="#s-profile-line"/></svg>',
  "concentricity": '<svg class="sym" aria-hidden="true"><use href="#s-concentricity"/></svg>',
  "runout": '<svg class="sym" aria-hidden="true"><use href="#s-runout"/></svg>',
  "total-runout": '<svg class="sym" aria-hidden="true"><use href="#s-total-runout"/></svg>',
  "mmc": '<svg class="sym" aria-hidden="true"><use href="#s-mmc"/></svg>',
  "lmc": '<svg class="sym" aria-hidden="true"><use href="#s-lmc"/></svg>',
  "rfs": '<svg class="sym" aria-hidden="true"><use href="#s-rfs"/></svg>'
};

function rich(text) {
  return String(text).replace(/\[([a-z-]+)\]/g, function (m, key) {
    return SYMBOLS[key] || m;
  });
}

/* Feature control frame builder: each argument is one compartment,
   and "|" separates tokens inside a compartment. */
function F() {
  var cells = Array.prototype.slice.call(arguments);
  return '<span class="fcf">' + cells.map(function (cell) {
    return '<span class="cell">' + cell.split("|").map(rich).join("") + "</span>";
  }).join("") + "</span>";
}

const TOPICS = [
  { id: "fundamentals", name: "What GD&T is",            sym: "s-dia" },
  { id: "comparison",   name: "GD&T vs ± tolerancing",   sym: "s-parallelism" },
  { id: "symbols",      name: "Symbols & categories",    sym: "s-flatness" },
  { id: "dof",          name: "Degrees of freedom",      sym: "s-axes" },
  { id: "datums",       name: "Datums",                  sym: "s-datum" },
  { id: "fcf",          name: "Feature control frame",   sym: "s-frame" },
  { id: "mmc",          name: "MMC / LMC / RFS & bonus", sym: "s-mmc" },
  { id: "mmb",          name: "MMB & datum shift",       sym: "s-shift" },
  { id: "inspection",   name: "Inspection & tools",      sym: "s-gauge" },
  { id: "rules",        name: "Rules of GD&T",           sym: "s-rule" }
];

const QUESTIONS = [
  /* ---------------- Fundamentals ---------------- */
  {
    id: "f1", topic: "fundamentals", level: "Core",
    q: "What does GD&T stand for?",
    options: [
      "Geometric Dimensioning and Tolerancing",
      "General Dimensioning and Tolerancing",
      "Geometric Design and Tolerance",
      "Global Dimensioning and Tolerance"
    ],
    answer: 0,
    why: "GD&T is Geometric Dimensioning and Tolerancing: the symbol language that defines the allowable variation of features on an engineering drawing."
  },
  {
    id: "f2", topic: "fundamentals", level: "Core",
    q: "Which standard is the primary GD&T reference used in North America?",
    options: ["ASME Y14.5", "ISO 1101", "ANSI B4.1", "ASME Y14.41"],
    answer: 0,
    why: "ASME Y14.5 is the governing US standard. ISO 1101 is the international equivalent, B4.1 covers limits and fits, and Y14.41 covers digital product definition data."
  },
  {
    id: "f3", topic: "fundamentals", level: "Core",
    q: "What is the primary purpose of GD&T on a drawing?",
    options: [
      "To define the allowable variation of features in terms of function and assembly",
      "To specify the machining process for every feature on the part",
      "To state the exact nominal size of every surface and hole",
      "To replace tolerances with a single general note on the drawing"
    ],
    answer: 0,
    why: "GD&T communicates design intent: how much a feature may vary and in which way, based on how the part functions and assembles."
  },
  {
    id: "f4", topic: "fundamentals", level: "Core",
    q: "Which of these is a feature of size?",
    options: [
      "A hole dimensioned [dia]10.0 – 10.2",
      "A flat machined face on a housing",
      "A 1 × 45° chamfer on a shaft end",
      "A corner radius dimensioned R5"
    ],
    answer: 0,
    why: "A feature of size is a cylindrical or spherical surface, or a set of opposed parallel surfaces, associated with a size dimension. A hole with diameter limits qualifies; a plane, chamfer or radius does not."
  },
  {
    id: "f5", topic: "fundamentals", level: "Intermediate",
    q: "Which of these is NOT a benefit of GD&T?",
    options: [
      "It removes the need to inspect the finished part",
      "It communicates design intent and function unambiguously",
      "It can accept more good parts through bonus tolerance",
      "It gives tolerance zones that match how the part assembles"
    ],
    answer: 0,
    why: "GD&T changes what and how you inspect (usually making inspection more functional), but it never removes the need for verification."
  },

  /* ---------------- GD&T vs ± tolerancing ---------------- */
  {
    id: "c1", topic: "comparison", level: "Core",
    q: "A hole is located by 30.0 ±0.2 and 50.0 ±0.2 from two edges. What shape is its location tolerance zone?",
    options: [
      "A square, 0.4 wide in each direction",
      "A circle 0.4 in diameter",
      "Two parallel planes 0.4 apart",
      "A cylinder 0.2 in diameter"
    ],
    answer: 0,
    why: "Two independent ± limits create a square (rectangular) zone. Every allowed combination of X and Y deviation sits inside that square, including its corners."
  },
  {
    id: "c2", topic: "comparison", level: "Intermediate",
    q: "What is the main functional weakness of that square ± location zone?",
    options: [
      "A hole can drift diagonally to 1.41 times the ± value and still pass, which may prevent assembly",
      "It rejects every part whose hole is slightly off in both directions",
      "It allows no deviation at all in the diagonal direction",
      "It controls the size of the hole instead of its location"
    ],
    answer: 0,
    why: "Corner-to-corner, the square allows √2 times the ± value (1.41 × 0.2 = 0.28). A round clearance around a fastener does not, so good print compliance can still fail to assemble."
  },
  {
    id: "c3", topic: "comparison", level: "Intermediate",
    q: "Under traditional ± tolerancing, how is the perpendicularity of a hole axis controlled?",
    options: [
      "Only indirectly, through the limits of size (Rule #1)",
      "By a separate perpendicularity tolerance in the title block",
      "By the surface finish callout on the hole",
      "It is not controlled in any way by the drawing"
    ],
    answer: 0,
    why: "± tolerancing has no orientation control. Rule #1 limits the axis to the size envelope, which ties orientation to hole size in a way that usually over-constrains the part."
  },
  {
    id: "c4", topic: "comparison", level: "Intermediate",
    q: "What is the practical advantage of a cylindrical position zone over a square ± zone?",
    options: [
      "The allowed deviation is the same in every direction, matching the clearance available",
      "It permits a larger hole size than a ± tolerance would allow",
      "It eliminates the need for datum references",
      "It automatically allows the maximum bonus tolerance in all cases"
    ],
    answer: 0,
    why: "Function is usually radial: a fastener has equal clearance all around. A round zone models that, and it also makes bonus tolerance straightforward."
  },
  {
    id: "c5", topic: "comparison", level: "Core",
    q: "Which callout is an example of coordinate (traditional) tolerancing?",
    options: [
      "25.0 ±0.1 from the left edge, 40.0 ±0.1 from the bottom edge",
      F("position", "dia|0.25|mmc", "A", "B", "C"),
      F("profile-surface", "0.3", "A", "B"),
      F("perpendicularity", "0.05", "A")
    ],
    answer: 0,
    why: "Coordinate tolerancing locates features with independent ± dimensions in X and Y. The other three are geometric controls."
  },

  /* ---------------- Symbols & categories ---------------- */
  {
    id: "s1", topic: "symbols", level: "Core",
    q: "How many categories of geometric characteristics does ASME Y14.5 define?",
    options: ["Five", "Three", "Four", "Six"],
    answer: 0,
    why: "Five: form, orientation, location, profile and runout. Knowing which category a symbol belongs to tells you whether it can use a datum and what it controls."
  },
  {
    id: "s2", topic: "symbols", level: "Core",
    q: "Which characteristic is a form control that never uses a datum?",
    options: ["Flatness", "Perpendicularity", "Position", "Profile of a surface"],
    answer: 0,
    why: "Form controls (straightness, flatness, circularity, cylindricity) are self-referencing. Adding a datum to flatness would make it an orientation control instead."
  },
  {
    id: "s3", topic: "symbols", level: "Intermediate",
    q: "Which characteristic can control size, form, orientation and location at the same time?",
    options: [
      "Profile of a surface",
      "Position",
      "Perpendicularity",
      "Total runout"
    ],
    answer: 0,
    why: "Profile of a surface is the most powerful control: with basic dimensions and datums it locates and orients a surface while also limiting its form and, on a feature of size, its size."
  },
  {
    id: "s4", topic: "symbols", level: "Core",
    q: "Which of these is an orientation control?",
    options: ["Perpendicularity", "Circularity", "Position", "Cylindricity"],
    answer: 0,
    why: "Orientation controls are angularity, perpendicularity and parallelism. They relate a feature to a datum at a basic angle, but do not locate it."
  },
  {
    id: "s5", topic: "symbols", level: "Intermediate",
    q: "Which symbol controls the combined effect of form, orientation and location of a surface during a full rotation about a datum axis?",
    options: ["Total runout", "Circular runout", "Concentricity", "Cylindricity"],
    answer: 0,
    why: "Total runout is a compound control checked over the entire surface while the part rotates, so it catches form error as well as eccentricity and tilt. Circular runout looks only at individual cross-sections."
  },
  {
    id: "s6", topic: "symbols", level: "Advanced",
    q: "Which two characteristics were eliminated in ASME Y14.5-2018?",
    options: [
      "Concentricity and symmetry",
      "Flatness and straightness",
      "Profile of a line and profile of a surface",
      "Circular runout and total runout"
    ],
    answer: 0,
    why: "The 2018 edition removed concentricity and symmetry because position and profile do the same job with clearer, verifiable tolerance zones. Older drawings may still show them."
  },
  {
    id: "s7", topic: "symbols", level: "Intermediate",
    q: "What does cylindricity control?",
    options: [
      "Both circular and longitudinal elements of a cylinder at once, with no datum",
      "The diameter of the cylinder relative to a datum axis",
      "The straightness of the cylinder's axis only",
      "The roundness of a single cross-section anywhere on the part"
    ],
    answer: 0,
    why: "Cylindricity is a form control that keeps every point of the surface inside two coaxial cylinders. It is stricter than circularity, which only checks individual cross-sections."
  },

  /* ---------------- Degrees of freedom ---------------- */
  {
    id: "d1", topic: "dof", level: "Core",
    q: "How many degrees of freedom does a free rigid body have?",
    options: ["Six", "Three", "Nine", "Twelve"],
    answer: 0,
    why: "Three translations (X, Y, Z) and three rotations (about X, Y, Z) — six total. The datum reference frame exists to remove them."
  },
  {
    id: "d2", topic: "dof", level: "Core",
    q: "How many degrees of freedom does a primary datum plane remove?",
    options: ["Three", "Two", "One", "Six"],
    answer: 0,
    why: "A plane removes one translation (normal to it) and two rotations, leaving two translations in the plane and one rotation about its normal."
  },
  {
    id: "d3", topic: "dof", level: "Core",
    q: "How many degrees of freedom do the secondary and tertiary datums remove, respectively?",
    options: ["Two and one", "Three and two", "One and two", "Two and two"],
    answer: 0,
    why: "Primary 3 + secondary 2 + tertiary 1 = 6. That is why the datum letters in an FCF are written in a specific order."
  },
  {
    id: "d4", topic: "dof", level: "Advanced",
    q: "A datum axis established by a cylindrical datum feature of size constrains how many degrees of freedom?",
    options: ["Four", "Two", "Six", "One"],
    answer: 0,
    why: "Two translations plus two rotations are removed. The part is still free to translate along the axis and to rotate about it — which is why a clocking datum is needed for a hole pattern."
  },
  {
    id: "d5", topic: "dof", level: "Intermediate",
    q: "Why does the order of datums in the FCF change the measurement?",
    options: [
      "It decides which feature contacts the simulator first and therefore which DOF are constrained first",
      "It changes the size of the tolerance zone in the first compartment",
      "It only affects the drawing's title block references",
      "It has no effect; only the letters themselves matter"
    ],
    answer: 0,
    why: "Datum precedence sets the physical setup. A part seated on A then B rests differently from one seated on B then A, so the measured values can differ."
  },
  {
    id: "d6", topic: "dof", level: "Advanced",
    q: "A part is located by primary plane A and by hole B, whose axis is perpendicular to A. Which degree of freedom remains free?",
    options: [
      "Rotation about the axis of hole B",
      "Translation along the axis of hole B",
      "Rotation about an axis lying in plane A",
      "Translation across plane A"
    ],
    answer: 0,
    why: "Plane A removes 3 DOF and hole B removes 2 translations plus 2 rotations, leaving rotation about the hole axis. A tertiary slot or second hole clocks the part."
  },

  /* ---------------- Datums ---------------- */
  {
    id: "t1", topic: "datums", level: "Core",
    q: "A datum is best defined as:",
    options: [
      "A theoretically exact plane, axis or point derived from a datum feature",
      "The actual surface of the part that rests on the inspection table",
      "Any feature the inspector chooses as a starting point",
      "The centreline drawn on the drawing for reference only"
    ],
    answer: 0,
    why: "The datum is theoretical and exact; the real surface is the datum feature. Inspection equipment simulates the theoretical datum from that real feature."
  },
  {
    id: "t2", topic: "datums", level: "Core",
    q: "A datum feature is:",
    options: [
      "The actual part feature from which a datum is established",
      "The theoretical plane used as the origin of measurement",
      "The gauge pin or surface plate used during inspection",
      "The letter placed inside the feature control frame"
    ],
    answer: 0,
    why: "Datum feature = the real, imperfect surface on the part. Datum = the exact geometry derived from it. Datum feature symbol = the boxed letter flagging that feature on the drawing."
  },
  {
    id: "t3", topic: "datums", level: "Intermediate",
    q: "A datum feature simulator is:",
    options: [
      "The inspection equipment, such as a surface plate or expanding mandrel, that contacts the datum feature",
      "The CAD model used to program the CMM",
      "The tolerance zone established by the feature control frame",
      "The software that fits geometry to measured points"
    ],
    answer: 0,
    why: "Simulators are the physical (or mathematical) counterpart of the datum. A surface plate simulates a datum plane; a chuck or mandrel simulates a datum axis."
  },
  {
    id: "t4", topic: "datums", level: "Intermediate",
    q: "Which statement about choosing datum features is correct?",
    options: [
      "They should be the surfaces that locate the part in assembly and must be accessible to the inspector",
      "They should always be the largest surfaces on the part regardless of function",
      "They should be machined last so that they are the most accurate",
      "They should be chosen by the inspector after the part is made"
    ],
    answer: 0,
    why: "Datums must mirror function. If the part mounts on a flange and a bore, those are the datum features — and they must be reachable by the gauge, otherwise the callout cannot be verified."
  },
  {
    id: "t5", topic: "datums", level: "Core",
    q: "The datum reference frame is:",
    options: [
      "Three mutually perpendicular planes that establish the origin and orientation for measurements",
      "The set of all datum features named anywhere on the drawing",
      "A single plane chosen as the primary datum",
      "The coordinate system of the CAD software"
    ],
    answer: 0,
    why: "The DRF is the three-plane coordinate system built from the primary, secondary and tertiary datums. All basic dimensions and tolerance zones are measured from it."
  },
  {
    id: "t6", topic: "datums", level: "Advanced",
    q: "When are datum targets specified?",
    options: [
      "When the datum feature is irregular, flexible or too large to contact reliably as a whole",
      "Whenever the part has more than three datum features",
      "Only when the primary datum is a feature of size",
      "Whenever the tolerance zone requires a cylindrical shape"
    ],
    answer: 0,
    why: "Datum targets define specific points, lines or areas on a datum feature. They make setup repeatable for castings, weldments, thin sheet and other surfaces that cannot be fixtured by full contact."
  },

  /* ---------------- Feature control frame ---------------- */
  {
    id: "q1", topic: "fcf", level: "Core",
    q: "Reading a feature control frame left to right, what is the order of the compartments?",
    options: [
      "Characteristic symbol, tolerance zone, material modifier, datum references",
      "Tolerance zone, characteristic symbol, datum references, material modifier",
      "Characteristic symbol, datum references, tolerance zone, material modifier",
      "Datum references, characteristic symbol, tolerance zone, material modifier"
    ],
    answer: 0,
    why: "Symbol first, then the size of the zone (with [dia] if it is cylindrical), then an optional [mmc]/[lmc]/[rfs] modifier, then the datum letters in order of precedence."
  },
  {
    id: "q2", topic: "fcf", level: "Core",
    q: "What does the [dia] symbol inside the tolerance compartment mean?",
    options: [
      "The tolerance zone is a cylinder of the stated diameter",
      "The feature itself must be perfectly round",
      "The tolerance applies to the diameter dimension only",
      "The tolerance is measured in degrees of arc"
    ],
    answer: 0,
    why: "[dia] describes the shape of the zone, not the feature. Without it, a location tolerance defaults to two parallel planes or a width zone."
  },
  {
    id: "q3", topic: "fcf", level: "Core",
    q: "In " + F("position", "dia|0.25|mmc", "A", "B", "C") + ", what does the [mmc] modifier mean?",
    options: [
      "The tolerance applies at MMC and grows as the feature departs from MMC",
      "The tolerance applies only when the feature is at its largest size",
      "The tolerance is fixed and never changes with feature size",
      "The datum features must all be at maximum material condition"
    ],
    answer: 0,
    why: "It is the stated tolerance at MMC plus bonus tolerance equal to the departure from MMC. It protects the worst-case boundary (virtual condition) while giving away tolerance as the hole grows or the shaft shrinks."
  },
  {
    id: "q4", topic: "fcf", level: "Core",
    q: "In " + F("position", "dia|0.25", "A", "B", "C") + ", how is datum precedence read?",
    options: [
      "Left to right: A is primary, B is secondary, C is tertiary",
      "Right to left: C is primary, B is secondary, A is tertiary",
      "Alphabetically, regardless of position in the frame",
      "The inspector selects the precedence during setup"
    ],
    answer: 0,
    why: "The letters appear in the order they must be established. A is the primary datum and removes 3 DOF, B removes 2, and C removes the last one."
  },
  {
    id: "q5", topic: "fcf", level: "Advanced",
    q: "In a composite position callout, what does the lower segment control?",
    options: [
      "The orientation and spacing of the pattern features relative to each other",
      "The size of the individual holes in the pattern",
      "The location of the pattern relative to the datum reference frame",
      "The surface finish inside each hole"
    ],
    answer: 0,
    why: "The upper segment locates the pattern as a group from the datums; the lower (feature-relating) segment controls how the holes relate to one another, usually with a smaller and often datum-free zone."
  },
  {
    id: "q6", topic: "fcf", level: "Core",
    q: "A basic dimension on a drawing is:",
    options: [
      "A theoretically exact dimension with no tolerance of its own",
      "A dimension with a general ± tolerance from the title block",
      "A dimension that may be ignored during inspection",
      "A dimension used only for reference and never inspected"
    ],
    answer: 0,
    why: "Basic dimensions (boxed) define true position, true profile or a basic angle. Their variation is controlled by the feature control frame they support."
  },
  {
    id: "q7", topic: "fcf", level: "Intermediate",
    q: "The tolerance compartment reads 0.1 with no [dia]. What shape is the zone for a hole axis?",
    options: [
      "Two parallel planes 0.1 apart",
      "A cylinder 0.1 in diameter",
      "A sphere 0.1 in diameter",
      "A square 0.1 on each side"
    ],
    answer: 0,
    why: "Without [dia], a location or orientation tolerance defaults to a width between two parallel planes (or two parallel lines in 2D). For a hole you almost always want [dia]."
  },
  {
    id: "q8", topic: "fcf", level: "Intermediate",
    q: "True position is:",
    options: [
      "The theoretically exact location defined by basic dimensions",
      "The location the feature ends up at after machining",
      "The centre of the tolerance zone as measured on the part",
      "The position of the feature at maximum material condition"
    ],
    answer: 0,
    why: "True position is the nominal target — a theoretical point, line or plane. The position tolerance is a zone centred on it; the measured axis must fall inside that zone."
  },

  /* ---------------- MMC / LMC / RFS ---------------- */
  {
    id: "m1", topic: "mmc", level: "Core",
    q: "A hole is dimensioned [dia]10.0 – 10.2. What is its MMC?",
    options: ["10.0", "10.1", "10.2", "9.8"],
    answer: 0,
    why: "For an internal feature, maximum material means the most material present — the smallest hole, 10.0."
  },
  {
    id: "m2", topic: "mmc", level: "Core",
    q: "A shaft is dimensioned [dia]10.0 – 10.2. What is its MMC?",
    options: ["10.2", "10.0", "10.1", "9.8"],
    answer: 0,
    why: "For an external feature, maximum material is the largest shaft, 10.2. MMC is always the size that leaves the most material on the part."
  },
  {
    id: "m3", topic: "mmc", level: "Core",
    q: "What does RFS ([rfs]) mean?",
    options: [
      "The tolerance applies regardless of the feature's actual size, with no bonus",
      "The tolerance applies only at the largest permitted size",
      "The tolerance applies only at the smallest permitted size",
      "The feature must be measured in the free state"
    ],
    answer: 0,
    why: "RFS is the default in ASME Y14.5 unless a modifier is shown. The tolerance is a fixed value no matter where the actual size falls within its limits."
  },
  {
    id: "m4", topic: "mmc", level: "Intermediate",
    q: "Bonus tolerance is:",
    options: [
      "Extra tolerance equal to how far the feature departs from MMC",
      "A fixed 10% addition allowed on every geometric tolerance",
      "Tolerance granted when the datum feature is at LMC",
      "The difference between the upper and lower size limits"
    ],
    answer: 0,
    why: "At MMC the bonus is zero. As a hole grows toward LMC (or a shaft shrinks), the clearance increases and the same amount is added to the geometric tolerance."
  },
  {
    id: "m5", topic: "mmc", level: "Intermediate",
    q: "A hole [dia]10.0 – 10.4 has position " + F("position", "dia|0.2|mmc") + ". What is the largest total position tolerance possible?",
    options: ["[dia]0.6", "[dia]0.4", "[dia]0.2", "[dia]0.8"],
    answer: 0,
    why: "Bonus = departure from MMC = 10.4 − 10.0 = 0.4. Total = 0.2 + 0.4 = 0.6 at LMC. The permitted axis zone therefore grows from 0.2 to 0.6."
  },
  {
    id: "m6", topic: "mmc", level: "Advanced",
    q: "A hole [dia]8.0 – 8.2 has position " + F("position", "dia|0.15|mmc") + ". What is its virtual condition?",
    options: ["[dia]7.85", "[dia]8.0", "[dia]8.15", "[dia]8.35"],
    answer: 0,
    why: "For an internal feature, VC = MMC − geometric tolerance = 8.0 − 0.15 = 7.85. No portion of the hole may intrude into that boundary; that is the worst-case assembly limit."
  },
  {
    id: "m7", topic: "mmc", level: "Advanced",
    q: "When would you apply LMC to a hole's position tolerance?",
    options: [
      "When the minimum remaining wall or edge distance is the critical requirement",
      "When the hole must always assemble over a fixed pin",
      "When the hole size is not important to function",
      "When no datum reference frame is available"
    ],
    answer: 0,
    why: "LMC protects the outer boundary of the part. As the hole grows, wall thickness shrinks, so the geometric tolerance is tied to the largest hole and grows as the hole gets smaller."
  },

  /* ---------------- MMB & datum shift ---------------- */
  {
    id: "b1", topic: "mmb", level: "Intermediate",
    q: "What does a [mmc] modifier placed after a datum letter, as in " + F("position", "dia|0.2", "A", "B|mmc", "C") + ", mean?",
    options: [
      "Datum feature B applies at its maximum material boundary, which permits datum shift",
      "The position tolerance for B is converted to a size tolerance",
      "Datum B must be manufactured at its MMC size or the part is rejected",
      "The datum reference frame is invalid and must be redefined"
    ],
    answer: 0,
    why: "The modifier after a datum letter sets the boundary the simulator must respect (MMB, derived from the datum feature's MMC and its own geometric tolerance). Any clearance between the actual feature and that boundary becomes datum shift."
  },
  {
    id: "b2", topic: "mmb", level: "Intermediate",
    q: "Datum shift is:",
    options: [
      "Movement of the part allowed by clearance between the datum feature and its simulator at MMB",
      "The extra tolerance gained when the toleranced hole departs from MMC",
      "The error introduced when a datum is not perpendicular to its reference",
      "The distance between the primary and secondary datums"
    ],
    answer: 0,
    why: "On a CMM, shift is the mathematical freedom to move or rotate the part within the datum-feature clearance; mechanically it is the part moving on a gauge pin before clamping."
  },
  {
    id: "b3", topic: "mmb", level: "Advanced",
    q: "What is the difference between bonus tolerance and datum shift?",
    options: [
      "Bonus comes from the toleranced feature's departure from MMC; shift comes from the datum feature's departure from MMB",
      "Bonus comes from the datum feature; shift comes from the toleranced feature",
      "They are two names for exactly the same allowance",
      "Bonus applies only to holes and shift applies only to shafts"
    ],
    answer: 0,
    why: "Two different features, two different allowances. Bonus grows the position zone; shift moves the whole pattern relative to the datums."
  },
  {
    id: "b4", topic: "mmb", level: "Advanced",
    q: "A hole [dia]10.0 – 10.2 is datum B at MMB, simulated by a 10.0 pin. What is the maximum datum shift?",
    options: [
      "0.2 total, i.e. 0.1 in any radial direction",
      "0.4 total, i.e. 0.2 in any radial direction",
      "0.1 total, i.e. 0.05 in any radial direction",
      "No shift is allowed with a pin simulator"
    ],
    answer: 0,
    why: "Shift equals the hole's departure from MMB: 10.2 − 10.0 = 0.2 on diameter, which is 0.1 of radial play around the pin."
  },
  {
    id: "b5", topic: "mmb", level: "Advanced",
    q: "Which statement about datum shift is true?",
    options: [
      "It cannot simply be added to the position tolerance; how much helps depends on direction",
      "It is always fully additive to the position tolerance in every direction",
      "It applies equally whether or not a datum modifier is shown",
      "It only exists when the datum is a flat plane"
    ],
    answer: 0,
    why: "Shift is a freedom of the whole part, not extra zone for one feature. It may help in one direction and not at all in another, which is why CMM software optimises it rather than adding it."
  },

  /* ---------------- Inspection ---------------- */
  {
    id: "n1", topic: "inspection", level: "Core",
    q: "What is the most direct way to verify flatness on a small precision surface?",
    options: [
      "A surface plate with a dial indicator, or an optical flat for very fine work",
      "A micrometer across the surface",
      "A plug gauge entered into the nearest hole",
      "A caliper measured across opposite edges"
    ],
    answer: 0,
    why: "Flatness is a form control with no datum, so the surface is compared with itself: a plate plus indicator maps high points, and an optical flat shows interference bands."
  },
  {
    id: "n2", topic: "inspection", level: "Intermediate",
    q: "A functional (hard) gauge checks:",
    options: [
      "The virtual condition boundary, giving a go/no-go verdict for worst-case assembly",
      "The exact measured value of every geometric tolerance",
      "The surface roughness of the datum features",
      "The material hardness of the part"
    ],
    answer: 0,
    why: "Hard gauges are built to the virtual condition of the feature and datums, so a part that fits is guaranteed to assemble. They accept everything within the boundary, including form error."
  },
  {
    id: "n3", topic: "inspection", level: "Intermediate",
    q: "How does a CMM evaluate a GD&T callout?",
    options: [
      "It probes points, fits geometry such as planes and axes, then compares that to the tolerance zone and datums",
      "It projects a shadow of the part onto a screen and measures the outline",
      "It measures only the size of each feature and infers the rest",
      "It checks the part against a hardened replica of the mating component"
    ],
    answer: 0,
    why: "The CMM collects coordinates, fits substitute geometry (least squares or minimum zone), builds the datum reference frame and reports the deviation from the specified zone."
  },
  {
    id: "n4", topic: "inspection", level: "Intermediate",
    q: "What is required to measure total runout?",
    options: [
      "A datum axis established by rotation, with an indicator reading the whole surface through 360°",
      "A flat surface plate and a height gauge only",
      "A pin gauge that matches the hole's MMC size",
      "Two caliper readings taken 90° apart"
    ],
    answer: 0,
    why: "Runout is a rotating measurement: the part is held on its datum axis and the indicator sweeps the surface along its full length, capturing form, orientation and location together."
  },
  {
    id: "n5", topic: "inspection", level: "Core",
    q: "Which tool is used to check a bore diameter on the shop floor?",
    options: [
      "A bore gauge or a set of plug/pin gauges",
      "A depth micrometer",
      "A radius gauge",
      "A feeler gauge"
    ],
    answer: 0,
    why: "Bore gauges transfer the diameter to a micrometer for a reading; plug gauges give a fast go/no-go at the size limits. Feeler and radius gauges measure gaps and fillets."
  },
  {
    id: "n6", topic: "inspection", level: "Advanced",
    q: "In metrology software, a 'soft gauge' means:",
    options: [
      "Evaluating the tolerance mathematically from measured points instead of using hard tooling",
      "A gauge that has been calibrated outside its normal interval",
      "A gauge made from a softer material than the part",
      "A gauge used only for surface finish checks"
    ],
    answer: 0,
    why: "Soft gauging builds the virtual condition and datums in software. It is flexible and gives values rather than a verdict, but it depends entirely on correct datum and fitting settings."
  },

  /* ---------------- Rules ---------------- */
  {
    id: "u1", topic: "rules", level: "Core",
    q: "What does Rule #1, the envelope principle, state?",
    options: [
      "The surface of a regular feature of size may not extend beyond a boundary of perfect form at MMC",
      "Every feature must be inspected at maximum material condition",
      "Every geometric tolerance must reference at least one datum",
      "Basic dimensions must always be inspected with a CMM"
    ],
    answer: 0,
    why: "Limits of size control form. A shaft at its largest permitted size must be perfectly straight; as it gets smaller, it may bend or ovalise within the envelope."
  },
  {
    id: "u2", topic: "rules", level: "Core",
    q: "Under Rule #1, a shaft produced exactly at its MMC must be:",
    options: [
      "Perfectly straight and cylindrical",
      "Allowed to bend as long as its size is within limits",
      "Inspected with a functional gauge only",
      "Free of any geometric tolerance callout"
    ],
    answer: 0,
    why: "At MMC there is no room left inside the envelope for form error, so perfect form is required. Any form tolerance you add must be within the available size departure."
  },
  {
    id: "u3", topic: "rules", level: "Core",
    q: "A basic dimension carries:",
    options: [
      "No tolerance of its own; its variation is controlled by the feature control frame",
      "The general tolerance stated in the title block",
      "A ±0.5 tolerance unless otherwise noted",
      "The same tolerance as the nearest size dimension"
    ],
    answer: 0,
    why: "Basic dimensions are boxed and theoretically exact. They tell you where true position or true profile is; the geometric tolerance says how far from it you may be."
  },
  {
    id: "u4", topic: "rules", level: "Core",
    q: "A dimension shown in parentheses is:",
    options: [
      "A reference dimension, for information only and not inspected",
      "A basic dimension used to locate a feature",
      "A dimension that must be held to the title-block tolerance",
      "A dimension that overrides the feature control frame"
    ],
    answer: 0,
    why: "Reference dimensions repeat information already given elsewhere. They carry no tolerance and are not used for acceptance."
  },
  {
    id: "u5", topic: "rules", level: "Core",
    q: "ASME Y14.5 specifies which standard temperature for dimensions?",
    options: ["20 °C (68 °F)", "25 °C (77 °F)", "0 °C (32 °F)", "22 °C (71.6 °F)"],
    answer: 0,
    why: "Dimensions apply at 20 °C. Measuring aluminium or steel far from that temperature introduces thermal error that can exceed a tight geometric tolerance."
  },
  {
    id: "u6", topic: "rules", level: "Core",
    q: "Do form tolerances require a datum?",
    options: [
      "No, form is independent of any datum",
      "Yes, they always need a primary datum",
      "Only when applied to a feature of size",
      "Only when the tolerance is less than 0.1"
    ],
    answer: 0,
    why: "Form controls compare a surface with itself. Attaching a datum to flatness would change the requirement into orientation, which is a different control."
  },
  {
    id: "u7", topic: "rules", level: "Intermediate",
    q: "Unless otherwise specified, dimensions and tolerances apply to the part:",
    options: [
      "In its finished condition, after all processing such as plating and heat treatment",
      "In the as-machined condition, before any coating is applied",
      "In the free state, before any stress relief",
      "At the time the raw material is received"
    ],
    answer: 0,
    why: "The drawing describes the finished part. If plating or heat treat changes size or form, the process must be planned so the finished part still meets the callouts."
  },
  {
    id: "u8", topic: "rules", level: "Intermediate",
    q: "Which statement about default tolerancing is correct?",
    options: [
      "Every dimension must have a tolerance unless it is basic, reference or a min/max limit",
      "Untoleranced dimensions are assumed to be basic",
      "Reference dimensions receive the title-block tolerance",
      "Only size dimensions require tolerances on a drawing"
    ],
    answer: 0,
    why: "A dimension without a tolerance is not inspectable, so ASME requires every dimension to be toleranced, basic, reference or stated as a limit (min/max)."
  }
];
