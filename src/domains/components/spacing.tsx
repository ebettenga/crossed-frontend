export const PageContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );


  export const Spacer: React.FC<{ margin: number | string }> = ({ margin }) => (
    <div style={{ margin }}></div>
  );
  