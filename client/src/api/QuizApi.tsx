import apiClient from "./apiClient";

export const createQuiz = async (quizData: any) => {
  const response = await apiClient.post("/quizzes", quizData);
  return response.data;
};

export const updateQuiz = async (quizId: number, quizData: any) => {
  const response = await apiClient.patch(`/quizzes/${quizId}`, quizData);
  return response.data;
};
