import React, { useState, useEffect } from "react";
import type { TicketConfig } from '../types/TicketTypes';

const defaultConfig: TicketConfig = {
  nombreTienda: "La Burbuja Feliz",
  rfc: "S/N",
  direccion: "C. 16 de Septiembre # Col, Villa Independenvia, Martinez de la Torre, Veracruz",
  telefono: "228 127 8853",
  leyenda: "¡Gracias por su compra!",
  anchoPapel: "80mm",
  fuente: "A",
};

const TicketConfigPanel = ({ onSave }: { onSave?: (config: TicketConfig) => void }) => {
  const [config, setConfig] = useState<TicketConfig>(defaultConfig);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ticketConfig");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
      }
    } catch {
      setConfig(defaultConfig);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ticketConfig", JSON.stringify(config));
    if (onSave) onSave(config);
    alert("Configuración guardada");
    window.location.reload();
  };

  return (
    <form onSubmit={handleSave}>
      <h2>Personalizar Ticket</h2>
      <label>
        Nombre de la tienda:
        <input name="nombreTienda" value={config.nombreTienda} onChange={handleChange} />
      </label>
      <label>
        RFC:
        <input name="rfc" value={config.rfc} onChange={handleChange} />
      </label>
      <label>
        Dirección:
        <input name="direccion" value={config.direccion} onChange={handleChange} />
      </label>
      <label>
        Teléfono:
        <input name="telefono" value={config.telefono} onChange={handleChange} />
      </label>
      <label>
        Leyenda final:
        <input name="leyenda" value={config.leyenda} onChange={handleChange} />
      </label>
      <label>
        Ancho de papel:
        <select name="anchoPapel" value={config.anchoPapel} onChange={handleChange}>
          <option value="80mm">80mm</option>
          <option value="58mm">58mm</option>
        </select>
      </label>
      <label>
        Fuente:
        <select name="fuente" value={config.fuente} onChange={handleChange}>
          <option value="A">Fuente A (normal)</option>
          <option value="B">Fuente B (pequeña)</option>
        </select>
      </label>
      <button type="submit">Guardar configuración</button>
    </form>
  );
};

export default TicketConfigPanel;