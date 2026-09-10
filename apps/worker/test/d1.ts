import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Adaptador D1 sobre o SQLite embutido do Node.
 *
 * Serve para os testes rodarem o SQL de verdade — o mesmo que vai para o D1 —
 * sem precisar subir o runtime do Cloudflare. A superfície coberta é só a que
 * o repositório usa: prepare/bind/first/all/run/batch.
 */

type Row = Record<string, unknown>;

class Statement {
  private args: unknown[] = [];

  constructor(
    private readonly db: DatabaseSync,
    private readonly sql: string
  ) {}

  bind(...args: unknown[]) {
    this.args = args.map((value) =>
      typeof value === "boolean" ? Number(value) : value
    );
    return this;
  }

  async first<T = Row>(): Promise<T | null> {
    return (
      (this.db.prepare(this.sql).get(...(this.args as never[])) as T) ?? null
    );
  }

  async all<T = Row>(): Promise<{ results: T[] }> {
    return {
      results: this.db.prepare(this.sql).all(...(this.args as never[])) as T[]
    };
  }

  async run() {
    const result = this.db.prepare(this.sql).run(...(this.args as never[]));
    return { meta: { changes: Number(result.changes) } };
  }
}

export type FakeD1 = {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown[]>;
};

export function createTestDatabase(): FakeD1 {
  const db = new DatabaseSync(":memory:");

  const schema = readFileSync(
    fileURLToPath(new URL("../migrations/0001_init.sql", import.meta.url)),
    "utf8"
  );
  db.exec(schema);

  return {
    prepare: (sql: string) => new Statement(db, sql),
    batch: async (statements: Statement[]) => {
      db.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }
  };
}
