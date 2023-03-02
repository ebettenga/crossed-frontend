
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: string;
  }
  
  export const Button: React.FC<ButtonProps> = ({
    children: title,
    ...props
  }: {
    children: string;
  }) => (
    <button
      {...props}
      style={{
        alignItems: "center",
        appearance: "none",
        backgroundImage:
          "radial-gradient(100% 100% at 100% 0, #5adaff 0, #5468ff 100%)",
        border: 0,
        borderRadius: "6px",
        boxShadow:
          "rgba(45, 35, 66, .4) 0 2px 4px,rgba(45, 35, 66, .3) 0 7px 13px -3px,rgba(58, 65, 111, .5) 0 -3px 0 inset",
        boxSizing: "border-box",
        color: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        width: '150px',
        height: "48px",
        justifyContent: "center",
        lineHeight: 1,
        paddingLeft: "16px",
        paddingRight: "16px",
        transition: "box-shadow .15s,transform .15s",
        touchAction: "manipulation",
        fontSize: "18px",
      }}
    >
      {title}
    </button>
  );
  