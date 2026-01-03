export interface PMTask {
  id: string;
  name: string;
  months: number[]; // 0-indexed (0 = Jan, 11 = Dec)
}

export const PM_SCHEDULE: PMTask[] = [
  { id: "motors", name: "MOTORS", months: [0, 3, 6, 9] },
  { id: "cam-levers", name: "CAM LEVERS/PIVOTS", months: [0, 3, 6, 9] },
  { id: "spot-respot-cams", name: "SPOT/RESPOT CAMS", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: "table-spherical-bushing", name: "TABLE SPHERICAL BUSHING", months: [0, 3, 6, 9] },
  { id: "table-conn-rods", name: "TABLE CONN. RODS/BUSHINGS", months: [0, 3, 6, 9] },
  { id: "over-travel-lever", name: "OVER TRAVEL LEVER", months: [0, 6] },
  { id: "oilites-link", name: "OILITES IN SPOT/RESPOT LINK", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: "spot-respot-arm-fittings", name: "SPOT/RESPOT ARM FITTINGS", months: [0, 3, 6, 9] },
  { id: "solenoid-linkage", name: "SOLENOID LINKAGE", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: "table-drive", name: "TABLE DRIVE", months: [0, 6] },
  { id: "sweep-pantograph-links", name: "SWEEP PANTOGRAPH LINKS", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: "sweep-conn-rods", name: "SWEEP CONN. RODS/BEARINGS", months: [0, 3, 6, 9] },
  { id: "respot-cells", name: "RESPOT CELLS", months: [0, 3, 6, 9] },
  { id: "yoke-assembly", name: "YOKE ASSEMBLY", months: [0, 6] },
  { id: "yoke-spherical-bearings", name: "YOKE SPHERICAL BEARINGS", months: [0, 6] },
  { id: "shifter-link", name: "SHIFTER LINK", months: [0, 3, 6, 9] },
  { id: "respot-shifter-mechanism", name: "RESPOT SHIFTER MECHANISM", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: "distributor-pinion", name: "DISTRIBUTOR PINION/STOP BLADE", months: [0, 3, 6, 9] },
  { id: "distributor", name: "DISTRIBUTOR", months: [0, 6] },
  { id: "shuttle-assembly", name: "SHUTTLE ASSEMBLY", months: [0, 3, 6, 9] },
  { id: "belt-tensioner-oilites", name: "BELT TENSIONER OILITES", months: [0, 6] },
  { id: "ring-tube-oiler", name: "RING TUBE OILER", months: [0, 3, 6, 9] },
  { id: "ball-elevator", name: "BALL ELEVATOR", months: [0, 3, 6, 9] },
  { id: "rudder-drive", name: "RUDDER DRIVE", months: [0, 3, 6, 9] },
  { id: "track-rail-assembly", name: "TRACK RAIL ASSEMBLY", months: [0, 3, 6, 9] },
  { id: "start-switch-pivots", name: "START SWITCH PIVOTS", months: [0, 3, 6, 9] },
  { id: "pin-ejector-assembly", name: "PIN EJECTOR ASSEMBLY", months: [0, 6] },
  { id: "front-rollers", name: "FRONT ROLLERS & SUPPORTS", months: [0, 6] },
];
