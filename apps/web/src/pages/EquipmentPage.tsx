import { useState } from "react";
import { Link } from "react-router-dom";

import { SyncBadge } from "../components/SyncBadge";
import { useUserData } from "../hooks/useUserData";

export function EquipmentPage() {
  const { equipment, saveEquipment } = useUserData();
  const [next, setNext] = useState("");

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = next.trim();
    setNext("");

    if (
      !value ||
      equipment.some((item) => item.toLowerCase() === value.toLowerCase())
    ) {
      return;
    }

    void saveEquipment([...equipment, value]);
  }

  return (
    <div className="app-page">
      <div className="page-title-row">
        <div>
          <span className="section-kicker">Equipamentos</span>
          <h1>Inventário para treinos melhores</h1>
          <p>
            O gerador só sugere exercícios que cabem no que você tem em mãos.
          </p>
        </div>
        <SyncBadge />
      </div>

      <section className="panel-card">
        <form className="chat-form" onSubmit={add}>
          <label className="field" style={{ flex: 1 }}>
            <span className="u-visually-hidden">Novo equipamento</span>
            <input
              value={next}
              onChange={(event) => setNext(event.target.value)}
              placeholder="Ex.: elástico, cadeira, mochila com livros"
            />
          </label>
          <button className="hero-button" type="submit">
            Adicionar
          </button>
        </form>

        {equipment.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum equipamento cadastrado</strong>
            <p>Sem itens, o gerador monta treinos apenas com peso corporal.</p>
          </div>
        ) : (
          <ul className="chip-row" aria-label="Equipamentos cadastrados">
            {equipment.map((item) => (
              <li key={item}>
                <button
                  className="soft-chip soft-chip--button"
                  type="button"
                  onClick={() =>
                    void saveEquipment(
                      equipment.filter((value) => value !== item)
                    )
                  }
                  aria-label={`Remover ${item}`}
                >
                  {item}
                  <span aria-hidden="true">&times;</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="equipment-note">Toque em um item para removê-lo.</p>

        <Link
          className="hero-button hero-button--secondary"
          to="/app/gerar-treino"
        >
          Montar treino com estes itens
        </Link>
      </section>
    </div>
  );
}
