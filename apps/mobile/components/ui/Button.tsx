import { Text, Pressable, ActivityIndicator, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
}

export function Button({ 
  title, 
  loading, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-100',
    outline: 'bg-transparent border border-gray-200',
    danger: 'bg-red-50',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-gray-900',
    outline: 'text-gray-600',
    danger: 'text-red-600',
  };

  return (
    <Pressable
      className={`p-4 rounded-2xl items-center justify-center flex-row ${variants[variant]} ${props.disabled || loading ? 'opacity-60' : ''} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#2563eb'} />
      ) : (
        <Text className={`font-bold text-base ${textVariants[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
