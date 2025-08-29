import React, { useState } from 'react'

type Props = {
  question: { id: number, question: string, options: Record<string,string>, topics: string, difficulty: number },
  onSubmit: (choice: 'A'|'B'|'C'|'D') => Promise<void>,
  feedback?: { correct: boolean } | null
}

export default function QuestionCard({ question, onSubmit, feedback }: Props) {
  const [selected, setSelected] = useState<'A'|'B'|'C'|'D'|null>(null)

  return (
    <div className="card space-y-4">
      <div className="text-sm text-gray-500">Topics: {question.topics} • Difficulty: {question.difficulty}</div>
      <div className="text-xl font-semibold">{question.question}</div>
      <div className="grid gap-3">
        {(['A','B','C','D'] as const).map(k => (
          <label key={k} className={`border rounded-xl p-3 cursor-pointer ${selected === k ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
            <input
              type="radio"
              name="option"
              className="mr-2"
              checked={selected === k}
              onChange={() => setSelected(k)}
            />
            <span className="font-semibold mr-2">{k}.</span>{question.options[k]}
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          className="btn btn-primary"
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
        >
          Submit
        </button>
      </div>
      {feedback && (
        <div className={`mt-2 font-semibold ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.correct ? 'Correct!' : 'Incorrect.'}
        </div>
      )}
    </div>
  )
}
