import KanbanBoard from "./components/KanbanBoard/KanbanBoard";
import { sampleKanbanData } from "./mock/kanbanData";

function App() {
  return <KanbanBoard data={sampleKanbanData} />;
}

export default App;
