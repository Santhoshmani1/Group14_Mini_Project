export const getQuiz = async (quizId: number) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://68.220.56.30:3000/quizzes/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return response.json();
};
