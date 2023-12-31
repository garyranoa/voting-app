export default function useRoundStats({ votes, votingOptions }) {
  const allVotes = Object.keys(votes)
    .map((m) => {
      if (m.indexOf("spectator") < 0) {
        return {
          ...votes[m],
        }
      }
    })
    .filter((f) => !!f)
  const _votes = allVotes ? Object.values(allVotes) : []
  const votingOptionsStats = votingOptions
    ? Object.values(votingOptions).map((m) => {
        const opt = m.name
        const totalVoters = _votes.filter((f) => !!f).length
        const totalOptVotes = _votes.filter((f) => f.vote === opt).length
        const rating = parseFloat(
          ((totalOptVotes / totalVoters) * 100).toFixed(2)
        )
        const name = opt
        return {
          name,
          rating,
        }
      })
    : []

  return { votingOptionsStats }
}
