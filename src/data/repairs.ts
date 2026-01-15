import { RepairDefinition } from '@/types';

export const REPAIR_DEFINITIONS: RepairDefinition[] = [
  {
    id: 'front-end-motor-replacement',
    name: 'Front End Motor Replacement',
    category: 'Drive',
    description: 'Replacement of the front end drive motor and receptacle assembly.',
    requiredParts: [
      { partNumber: '610704052', quantity: 1, name: 'WH MTR/RECPT ASSY 115/60' },
      { partNumber: '070006219', quantity: 1, name: 'MTR-115/230-50 COMB' }
    ],
    instructionRef: {
      file: 'service',
      page: 12, // Placeholder page for motor instructions
      title: 'Motor Replacement Procedure'
    },
    assemblyRef: {
      file: 'parts',
      page: 4,
      title: 'FRONT END DRIVE ASSEMBLY'
    }
  },
  {
    id: 'sweep-drive-shaft-repair',
    name: 'Sweep Drive Shaft Repair',
    category: 'Drive',
    description: 'Repair of the sweep drive shaft and associated bearings.',
    requiredParts: [
      { partNumber: '070001699', quantity: 1, name: 'SHAFT, SWEEP DRIVE' },
      { partNumber: '000021744', quantity: 2, name: 'BEARING, SELF ALIGNG' },
      { partNumber: '000021905', quantity: 2, name: 'BEARING (LOCKING COLLAR)' }
    ],
    instructionRef: {
      file: 'service',
      page: 45, // Placeholder
      title: 'Sweep Drive Shaft Maintenance'
    },
    assemblyRef: {
      file: 'parts',
      page: 4,
      title: 'FRONT END DRIVE ASSEMBLY'
    }
  },
  {
    id: 'spot-link-latch-repair',
    name: 'Spot Link Latch Repair',
    category: 'Other',
    description: 'Repair of the spot and respot link latch assembly.',
    requiredParts: [
      { partNumber: '070001997', quantity: 1, name: 'LATCH ASSEMBLY-SPT ARM ASSY' },
      { partNumber: '070006493', quantity: 1, name: 'BALL-JOINT ASSEMBLY' }
    ],
    instructionRef: {
      file: 'service',
      page: 82, // Placeholder
      title: 'Spot/Respot Linkage Adjustments'
    },
    assemblyRef: {
      file: 'parts',
      page: 6,
      title: 'SPOT & RESPOT LINK ASSEMBLY'
    }
  }
];
