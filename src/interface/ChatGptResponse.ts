export interface ChatGptResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface InvalidCategoryGptResponse {
  id: string;
  category: string;
}
