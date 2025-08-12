-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActividadITCA" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineaEstrategica" TEXT NOT NULL,
    "actividad" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "objetivo" TEXT,
    "meta" TEXT,
    "indicador" TEXT,
    "producto" TEXT,
    "aliados" TEXT,
    "recursos" TEXT,
    "fechaProgramada" DATETIME,
    "fechaEjecucion" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'Programado',
    "observaciones" TEXT,
    "distrito" TEXT,
    "poblacionObjetivo" TEXT,
    "ubicacion" TEXT,
    "evidencias" JSONB,
    "trimestre" TEXT
);
INSERT INTO "new_ActividadITCA" ("actividad", "fecha", "id", "lineaEstrategica", "responsable") SELECT "actividad", "fecha", "id", "lineaEstrategica", "responsable" FROM "ActividadITCA";
DROP TABLE "ActividadITCA";
ALTER TABLE "new_ActividadITCA" RENAME TO "ActividadITCA";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
