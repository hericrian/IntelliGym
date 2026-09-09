import { useState } from "react";

type Message = { id: number; role: "user" | "assistant"; text: string };

const suggestions = ["Gerar treino de hoje", "Adaptar exercicio", "Informar dor", "Explicar progresso"];

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Posso adaptar seu treino considerando equipamentos, tempo disponivel e desconforto no joelho direito."
    }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  function send(nextText = text) {
    if (!nextText.trim()) return;
    const userMessage = { id: Date.now(), role: "user" as const, text: nextText };
    setMessages((current) => [...current, userMessage]);
    setText("");
    setLoading(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Modo mock: eu reduziria impacto, manteria ponte de gluteo e trocaria step alto por step baixo ou cadeira extensora leve. Quando FastAPI/Gemini estiverem conectados, esta resposta vira chamada autenticada."
        }
      ]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="app-page assistant-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Assistente</span>
          <h1>IA de treino e recuperacao</h1>
        </div>
      </div>
      <section className="chat-shell">
        <div className="chip-row">
          {suggestions.map((suggestion) => <button className="soft-chip soft-chip--button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}
        </div>
        <div className="message-list">
          {messages.map((message) => (
            <div className={`message-bubble message-bubble--${message.role}`} key={message.id}>{message.text}</div>
          ))}
          {loading ? <div className="message-bubble message-bubble--assistant">Pensando...</div> : null}
        </div>
        <form className="chat-form" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Descreva seu objetivo, dor ou duvida..." />
          <button className="hero-button">Enviar</button>
        </form>
      </section>
    </div>
  );
}

