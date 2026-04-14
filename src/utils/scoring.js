export function buildRankedParticipants(participants = [], submissions = []) {
  const participantMap = new Map(
    participants.map((participant) => [
      participant.username,
      {
        ...participant,
        score: 0,
        solvedCount: 0,
      },
    ]),
  );

  const correctByMission = new Map();

  submissions
    .filter((submission) => submission.isCorrect)
    .forEach((submission) => {
      if (!correctByMission.has(submission.missionId)) {
        correctByMission.set(submission.missionId, []);
      }

      correctByMission.get(submission.missionId).push(submission);
    });

  correctByMission.forEach((missionSubmissions) => {
    const firstCorrectByUser = new Map();

    missionSubmissions
      .sort((left, right) => (left.submittedAt ?? 0) - (right.submittedAt ?? 0))
      .forEach((submission) => {
        if (!firstCorrectByUser.has(submission.userId)) {
          firstCorrectByUser.set(submission.userId, submission);
        }
      });

    const ranked = [...firstCorrectByUser.values()];
    const totalSolvers = ranked.length;

    ranked.forEach((submission, index) => {
      const participant = participantMap.get(submission.userId);
      if (!participant) return;

      participant.score += totalSolvers - index;
      participant.solvedCount += 1;
    });
  });

  return [...participantMap.values()].sort((left, right) => {
    if ((right.score ?? 0) !== (left.score ?? 0)) {
      return (right.score ?? 0) - (left.score ?? 0);
    }

    return (left.createdAt ?? 0) - (right.createdAt ?? 0);
  });
}
