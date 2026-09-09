import { useState } from "react";

const initial = ["Halteres ajustaveis", "Mini band", "Bike ergometrica", "Colchonete", "Banco"];

export function EquipmentPage() {
  const [items, setItems] = useState(initial);
  const [next, setNext] = useState("");

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Equipamentos</span>
          <h1>Inventario para treinos melhores</h1>
        </div>
      </div>
      <section className="panel-card">
        <form className="chat-form" onSubmit={(event) => { event.preventDefault(); if (next.trim()) { setItems((current) => [...current, next]); setNext(""); } }}>
          <input value={next} onChange={(event) => setNext(event.target.value)} placeholder="Adicionar equipamento" />
          <button className="hero-button">Adicionar</button>
        </form>
        <div className="chip-row">
          {items.map((item) => <button className="soft-chip soft-chip--button" key={item} onClick={() => setItems((current) => current.filter((value) => value !== item))}>{item}</button>)}
        </div>
      </section>
    </div>
  );
}

