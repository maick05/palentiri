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
  title?: string;
  resume?: string;
  _id?: string;
}
