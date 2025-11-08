import Cal_Grid from '@/components/Cal_Grid/Cal_Grid';
import Shell from '@/components/Shell/Shell';
import { getBackendStatus } from '@/lib/server/actions/getBackendStatus';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const backendStatus = await getBackendStatus();

  return (
    <Shell backendStatus={backendStatus}>
      <Cal_Grid />
    </Shell>
  );
}
