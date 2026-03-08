// React example with JSX and TypeScript types
import type { ReactNode, FC } from "react";

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

const Button: FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = "primary",
}) => {
  const styles: Record<string, string> = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white",
    danger: "bg-red-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${styles[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

interface CounterState {
  count: number;
  history: number[];
}

interface CounterActions {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const Counter: FC = () => {
  const [state, setState] = React.useState<CounterState>({
    count: 0,
    history: [0],
  });

  const actions: CounterActions = {
    increment: () => {
      setState((prev) => ({
        count: prev.count + 1,
        history: [...prev.history, prev.count + 1],
      }));
    },
    decrement: () => {
      setState((prev) => ({
        count: prev.count - 1,
        history: [...prev.history, prev.count - 1],
      }));
    },
    reset: () => {
      setState({ count: 0, history: [0] });
    },
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Counter: {state.count}</h1>

      <div className="flex gap-2">
        <Button onClick={actions.decrement}>-</Button>
        <Button onClick={actions.increment}>+</Button>
        <Button onClick={actions.reset} variant="danger">
          Reset
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        <p>History: {state.history.join(" → ")}</p>
      </div>
    </div>
  );
};

export default Counter;
