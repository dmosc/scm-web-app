module.exports = {
  async up(db) {
    const turns = await db
      .collection('turns')
      .find()
      .toArray();

    const updates = [];

    turns.forEach(({ _id }, index) =>
      updates.push(
        db.collection('turns').updateOne({ _id }, { $set: { uniqueId: 1000000 + index } })
      )
    );

    await Promise.all(updates);
  },
  async down(db) {
    return db.collection('turns').updateMany({}, { $unset: { uniqueId: '' } });
  }
};
