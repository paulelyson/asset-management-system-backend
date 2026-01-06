export const GetBorrowedEquipmentAggregate = (query: any, page: number, limit: number): any[] => [
  {
    $unwind: {
      path: '$borrowedEquipment',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'borrower',
      foreignField: '_id',
      as: 'borrower',
    },
  },
  {
    $unwind: {
      path: '$borrower',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'faculty',
      foreignField: '_id',
      as: 'faculty',
    },
  },
  {
    $unwind: {
      path: '$faculty',
    },
  },
  {
    $lookup: {
      from: 'equipment',
      localField: 'borrowedEquipment.equipment',
      foreignField: '_id',
      as: 'equipment',
    },
  },
  {
    $unwind: {
      path: '$equipment',
    },
  },
  {
    $project: {
      'borrower._id': 1,
      'borrower.firstName': 1,
      'borrower.lastName': 1,
      classDepartment: 1,
      'faculty._id': 1,
      'faculty.firstName': 1,
      'faculty.lastName': 1,
      purpose: 1,
      classCode: 1,
      className: 1,
      dateOfUseStart: 1,
      dateOfUseEnd: 1,
      timeOfUseStart: 1,
      timeOfUseEnd: 1,
      'equipment._id': 1,
      'equipment.name': 1,
      'equipment.brand': 1,
      'equipment.images': 1,
      quantity: '$borrowedEquipment.quantity',
      borrowedEquipmentStatus: '$borrowedEquipment.borrowedEquipmentStatus',
      releasedQtyCond: '$borrowedEquipment.releasedQtyCond',
      returnedQtyCond: '$borrowedEquipment.returnedQtyCond',
      status: '$borrowedEquipment.status',
      remarks: '$borrowedEquipment.remarks',
      dis: 1,
    },
  },
  {
    $match: query,
  },
  {
    $skip: limit * (page - 1),
  },
  {
    $limit: limit,
  },
];
