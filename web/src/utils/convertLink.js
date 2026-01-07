//input: https://gyazo.com/160a9fe00d05b15e00e0e8f75165d771
//output: https://i.gyazo.com/160a9fe00d05b15e00e0e8f75165d771.png
export const convertLink = (link) => {
  try {
    const url = new URL(link);
    const path = url.pathname;
    const id = path.split("/").pop();
    return `https://i.gyazo.com/${id}.png`;
  } catch (error) {
    console.error("convert link error:", error);
    return link;
  }
};
