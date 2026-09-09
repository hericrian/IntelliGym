import { useState } from "react";
import { Link } from "react-router-dom";

import { getEquipment, saveEquipment } from "../lib/trainingStore";

export function EquipmentPage() {
  const [items, setItems] = useState(getEquipment);
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
        <form className="chat-form" onSubmit={(event) => { event.preventDefault(); if (next.trim()) { setItems((current) => { const nextItems = [...current, next.trim()]; saveEquipment(nextItems); return nextItems; }); setNext(""); } }}>
          <input value={next} onChange={(event) => setNext(event.target.value)} placeholder="Ex.: elástico, cadeira, mochila com livros" />
          <button className="hero-button">Adicionar</button>
        </form>
        <div className="chip-row">
          {items.map((item) => <button className="soft-chip soft-chip--button" key={item} onClick={() => setItems((current) => { const nextItems = current.filter((value) => value !== item); saveEquipment(nextItems); return nextItems; })}>{item} ×</button>)}
        </div>
        <p className="equipment-note">Toque em um item para removê-lo. O inventário fica salvo neste dispositivo e será usado ao gerar seu plano.</p>
        <Link className="hero-button hero-button--secondary" to="/app/gerar-treino">Montar treino com estes itens</Link>
      </section>
    </div>
  );
}
