// Server Component
import { EditBatchPageContent } from './EditBatchPageContent';

export default function BatchPage({ params }: { params: { id: string } }) {
  return <EditBatchPageContent id={params.id} />;
} 