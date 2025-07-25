import { type ReactNode } from 'react';

interface Props {
  sidebar: ReactNode;
  chart: ReactNode;
}

export const MainLayout = ({ sidebar, chart }: Props) => {
  return (
    <main className="flex flex-row min-h-screen min-w-screen justify-evenly items-center p-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        {sidebar}
      </div>
      <div className="w-[800px] h-[700px] flex justify-center items-center relative">
        {chart}
      </div>
    </main>
  );
};
