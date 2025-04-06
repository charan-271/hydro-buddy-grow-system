
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { WebSocketMessage } from '@/types/types';

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
}

const useWebSocket = ({ url, onMessage, reconnectInterval = 5000 }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        toast({
          title: "Connected to Hydro Buddy",
          description: "Receiving real-time sensor data",
        });
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after specified interval
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Hydro Buddy device",
          variant: "destructive"
        });
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }, [url, onMessage, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected.');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect: connect,
    disconnect
  };
};

export default useWebSocket;
