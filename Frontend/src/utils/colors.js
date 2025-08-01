export const getColumnColor = (status) => {
  switch (status) {
    case "To-do":
      return "#ef6c00"; // orange
    case "Yet to Start":
      return "#827717"; // olive
    case "In-Progress":
      return "#0d47a1"; // blue
    case "On-Hold":
      return "#880e4f"; // pink
    case "Completed":
      return "#1b5e20"; // green
    default:
      return "#424242"; // default dark
  }
};
