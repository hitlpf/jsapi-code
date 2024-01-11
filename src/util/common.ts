export const logger = function (text: string): void {
  console.log(text);
};

export const sleep = async function (deplay: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, deplay);
  });
};
