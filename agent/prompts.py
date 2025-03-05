prompts = {
    generate_assessment:"""
    "Generate 5 multiple-choice questions in JSON format about {topic} at a {level} difficulty level. Each question should follow this structure: json
CopyInsert
{
  question: '<question text>',
  options: ['<option1>', '<option2>', '<option3>', '<option4>'],
  correctAnswer: '<correct option>'
}
Ensure that:

1. The question is clear, concise, and related to the topic.
2. The options are plausible and relevant to the question.
3. The correctAnswer is one of the options.
4. All questions are at the specified difficulty level.
    """

}