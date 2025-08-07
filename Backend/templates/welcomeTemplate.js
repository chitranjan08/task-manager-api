module.exports = ({ name }) => {
  return {
    subject: '🎉 Welcome to Smart Task Manager!',
    text: `Hi ${name}, welcome to Smart Task Manager. We're excited to have you on board!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hi ${name}, 👋</h2>
        <p>Welcome to <strong>Smart Task Manager</strong>! We're thrilled to have you with us.</p>
        <p>You can now start creating and tracking your tasks more efficiently than ever.</p>
        <hr />
        <p>If you ever have questions, reach out to us anytime.</p>
        <p>Happy Tasking!<br/>— The Smart Task Manager Team</p>
      </div>
    `
  };
};
