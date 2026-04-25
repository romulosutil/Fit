import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View 
      className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 ${className}`} 
      {...props}
    >
      {children}
    </View>
  );
}
