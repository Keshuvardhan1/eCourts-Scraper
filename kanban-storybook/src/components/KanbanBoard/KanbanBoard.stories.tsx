import type { Meta, StoryObj } from "@storybook/react";
import KanbanBoard from "./KanbanBoard";
import { sampleKanbanData } from "../../mock/kanbanData";

const meta: Meta<typeof KanbanBoard> = { title: "Kanban/Board", component: KanbanBoard, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = { args: { data: sampleKanbanData } };

export const Empty: Story = { args: { data: { tasks: {}, columns: { todo:{id:"todo",title:"To Do",taskIds:[]}, progress:{id:"progress",title:"In Progress",taskIds:[]}, done:{id:"done",title:"Done",taskIds:[]} }, columnOrder:["todo","progress","done"] } } };

export const Large: Story = { args: { data: generateLarge(60) } };

function generateLarge(n:number) {
  const tasks:any={}; const ids:string[]=[];
  for (let i=1;i<=n;i++){ const id=`task-${i}`; tasks[id]={id,title:`Task ${i} — long text for layout`,priority: i%4===0?"urgent":"medium",assignee:["A","B","C"][i%3],tags:["t1"], dueDate:"2025-01-30"}; ids.push(id);}
  return { tasks, columns:{ todo:{id:"todo",title:"To Do",taskIds:ids}, progress:{id:"progress",title:"In Progress",taskIds:[]}, done:{id:"done",title:"Done",taskIds:[]} }, columnOrder:["todo","progress","done"]};
}

export const Mobile: Story = { args: { data: sampleKanbanData }, parameters: { viewport: { defaultViewport: "iphone12" } } };

export const Playground: Story = { args: { data: sampleKanbanData }, argTypes: { data: { control: "object" } } };
