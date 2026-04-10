const Button = ({ children, className = "" }) => {
  return (
    <button
      className={`rounded-lg py-2 px-3 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
