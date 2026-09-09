import { useEffect, useRef, useState } from "react";

type Message = { id: number; role: "user" | "assistant"; text: string };

const suggestions = [
  "Gerar treino de hoje",
  "Adaptar exercício",
  "Informar dor",
  "Explicar progresso"
];

const mockReply =
  "Modo demonstração: eu reduziria o impacto, manteria a ponte de glúteo e trocaria o step alto por um step baixo ou cadeira extensora leve. Quando a API estiver conectada, esta resposta vira uma chamada autenticada.";

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Posso adaptar seu treino considerando equipamentos, tempo disponível e desconforto no joelho direito."
    }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, loading]);

  function send(nextText = text) {
    const value = nextText.trim();
    if (!value || loading) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: value }
    ]);
    setText("");
    setLoading(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: mockReply }
      ]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="app-page assistant-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Assistente</span>
          <h1>IA de treino e recuperação</h1>
        </div>
      </div>

      <section className="chat-shell">
        <div className="chip-row">
          {suggestions.map((suggestion) => (
            <button
              className="soft-chip soft-chip--button"
              type="button"
              key={suggestion}
              disabled={loading}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div
          className="message-list"
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-label="Conversa"
        >
          {messages.map((message) => (
            <div
              className={`message-bubble message-bubble--${message.role}`}
              key={message.id}
            >
              {message.text}
            </div>
          ))}
          {loading ? (
            <div className="message-bubble message-bubble--assistant message-bubble--typing">
              <span className="spinner" aria-hidden="true" />
              Pensando...
            </div>
          ) : null}
        </div>

        <form
          className="chat-form"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label className="field" style={{ flex: 1 }}>
            <span className="u-visually-hidden">Mensagem</span>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Descreva seu objetivo, dor ou dúvida..."
            />
          </label>
          <button
            className="hero-button"
            type="submit"
            disabled={loading || !text.trim()}
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
