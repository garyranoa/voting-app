export default function useRoundStats({ votes, votingOptions }) {
  const _votes = votes ? Object.values(votes) : []
  const votingOptionsStats = Object.values(votingOptions).map((m) => {
    const opt = m.name
    const totalVoters = _votes.filter((f) => !!f).length
    const totalOptVotes = _votes.filter((f) => f.vote === opt).length
    const rating = parseFloat(((totalOptVotes / totalVoters) * 100).toFixed(2))
    const name = opt
    return {
      name,
      rating,
    }
  })

  return { votingOptionsStats }
}
