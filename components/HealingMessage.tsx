// components/HealingMessage.tsx
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function HealingMessage({ messages }: { messages: string[] }) {
  const [msg, setMsg] = useState(messages[0] ?? '');
  useEffect(() => {
    if (!messages?.length) return;
    const random = messages[Math.floor(Math.random() * messages.length)];
    setMsg(random);
  }, [messages]);
  return (
    <Text
      style={{
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
      }}
    >
      {msg}
    </Text>
  );
}
