import mammoth from 'mammoth';
import { useState, type ChangeEvent } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

const mainPrompt = (content = '') => {
  return `Виступай як експерт з воєнно-політичної обстановки.

  Завдання:
  Проаналізуй події висвітлені в новинах. Якщо контекст дозволяє можна доповнити контекстними подіями з минулого, але основне - свіжі дані. Перелік подій можна доповнити заявами державних діячів, або іншими новинами, які викладені в топ 100 новинних ресурсів світу різних країн, за умови, що це новини за останню добу і вони мають відношення до України, або впливають на новини, які надані нижче. 

  Вхідні дані:
  ${content}
  Формат відповіді в 2-х секціях:
  СЕКЦІЯ №1:
  - ті новини які не увійшли в підбірку надану нижче і які ти вважаєш необхідними додати з обовʼязковим посиланням на джерело.
  - військові маневри, навчання та ін. до яких залучене НАТО або ОДКБ, або Росія
  СЕКЦІЯ №2
  - короткий аналіз (від 3-ї особи) впливу на воєнно-політичну ситуацію в Україні
  - офіційно-діловий стиль викладення
  - уникнення журналістських та неофіційних висловлювань та неофіційних назв, фраз, популістських висловлювань, тощо

  Довжина відповіді: Максимум 3 абзаци.
  `;
};

type MessageType = {
  type: 'error' | 'success';
  message: string;
  timer?: boolean;
  executed?: boolean;
};

function App() {
  const [msgs, setMsgs] = useState<Array<MessageType | null>>([]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files) {
        setMsgs((prev) => {
          return [
            ...prev,
            {
              type: 'error',
              message: 'Щось пішло не так',
            },
          ];
        });
        return;
      }
      let content = '';
      for await (const file of Array.from(event.target.files)) {
        const arrayBuffer = await file.arrayBuffer();

        const result = await mammoth.extractRawText({
          arrayBuffer: arrayBuffer,
        });
        content += result.value.replaceAll(new RegExp(/(\n){1,}/, 'g'), '\n');
      }
      const ready = mainPrompt(content);
      await navigator.clipboard.writeText(ready);
      setMsgs((prev) => {
        return [
          ...prev,
          {
            type: 'success',
            message: 'Успішно скопійовано',
          },
        ];
      });
    } catch (error) {
      setMsgs((prev) => {
        return [
          ...prev,
          {
            type: 'error',
            message: 'Щось пішло не так',
          },
        ];
      });
    }
  };

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <br />
        <input multiple type="file" accept=".docx" onChange={handleFile} />

        {msgs.map((msg, idx) => {
          if (!msg) return null;

          setTimeout(() => {
            setMsgs((prev) => {
              return prev.map((msg, index) => {
                return idx === index ? null : msg;
              });
            });
          }, 5000);

          return (
            <>
              {msg.type === 'error' ? (
                <div style={{ padding: 20, background: '#ff000050' }}>
                  {msg.message}
                </div>
              ) : null}
              {msg.type === 'success' ? (
                <div style={{ padding: 20, background: '#00ff0050' }}>
                  {msg.message}
                </div>
              ) : null}
            </>
          );
        })}
      </section>
    </>
  );
}

export default App;
