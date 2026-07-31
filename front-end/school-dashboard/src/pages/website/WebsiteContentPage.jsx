import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Table from '../../components/ui/Table';
import Textarea from '../../components/ui/Textarea';
import { useCreateMutation, useDeleteMutation, useListQuery, useUpdateMutation } from '../../hooks/useApi';
import { websiteBlogApi, websiteEventsApi, websiteGalleryApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import {
  buildBlogFormData,
  buildEventFormData,
  buildGalleryFormData,
  extractList,
  GALLERY_CATEGORY_OPTIONS,
  toDateTimeLocal,
  WEBSITE_TABS,
} from './websiteContentConstants';

function StatusBadge({ published }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

function ActionButton({ onClick, children, danger = false, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2.5 transition-colors touch-manipulation ${
        danger
          ? 'text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100'
          : 'text-gray-400 hover:bg-primary/10 hover:text-primary active:bg-primary/15'
      }`}
    >
      {children}
    </button>
  );
}

function ContentTabPanel({
  tabKey,
  category,
  api,
  queryKey,
  columns,
  defaultValues,
  buildPayload,
  renderForm,
  requireFileOnCreate = false,
  getRowId,
  validateBeforeSubmit,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);

  const params = category ? { category } : undefined;
  const { data, isLoading, isError } = useListQuery(queryKey, api.list, params);
  const rows = useMemo(() => extractList(data), [data]);

  const { register, handleSubmit, reset } = useForm({ defaultValues });

  const createMutation = useCreateMutation(queryKey, api.create, {
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
      setFile(null);
      reset(defaultValues);
    },
  });

  const updateMutation = useUpdateMutation(
    queryKey,
    ({ id, data: payload }) => api.update(id, payload),
    {
      onSuccess: () => {
        setModalOpen(false);
        setEditing(null);
        setFile(null);
        reset(defaultValues);
      },
    },
  );

  const deleteMutation = useDeleteMutation(queryKey, api.delete, {
    onSuccess: () => setDeleteTarget(null),
  });

  const openCreateModal = () => {
    setEditing(null);
    setFile(null);
    reset(defaultValues);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    reset(editing ? {
      ...defaultValues,
      ...editing,
      start_date: editing.start_date ? toDateTimeLocal(editing.start_date) : '',
      end_date: editing.end_date ? toDateTimeLocal(editing.end_date) : '',
      is_published: Boolean(editing.is_published),
      order: editing.order ?? 0,
    } : defaultValues);
    setFile(null);
  }, [modalOpen, editing, reset, defaultValues]);

  const tableColumns = [
    ...columns,
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge published={row.is_published} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex justify-end gap-1 sm:gap-2">
          <ActionButton
            label="Edit"
            onClick={() => { setEditing(row); setModalOpen(true); }}
          >
            <FiEdit2 className="text-base" />
          </ActionButton>
          <ActionButton
            label="Delete"
            danger
            onClick={() => setDeleteTarget(row)}
          >
            <FiTrash2 className="text-base" />
          </ActionButton>
        </div>
      ),
    },
  ];

  const onSubmit = (values) => {
    if (validateBeforeSubmit?.(values, { editing, file })) {
      return;
    }
    if (!values.title?.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!editing && requireFileOnCreate && !file) {
      toast.error('Please upload an image.');
      return;
    }
    const payload = buildPayload(values, file, category);
    if (editing) {
      updateMutation.mutate({ id: getRowId(editing), data: payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={openCreateModal}
        >
          <FiPlus /> Add new
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <EmptyState title="Failed to load content" description="Please try again." />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Create the first entry for the public website."
          actionLabel="Add new"
          onAction={openCreateModal}
        />
      ) : (
        <Table columns={tableColumns} data={rows} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); setFile(null); }}
        title={editing ? 'Edit item' : 'Add item'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {renderForm({ register, file, setFile, editing, category })}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => { setModalOpen(false); setEditing(null); setFile(null); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={isSaving}
              disabled={isSaving}
            >
              {editing ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete item?"
        message="This will remove the content from the public website."
        onConfirm={() => deleteMutation.mutate(getRowId(deleteTarget))}
        onClose={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const currentTab = WEBSITE_TABS.find((tab) => tab.key === activeTab) || WEBSITE_TABS[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Website Content</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage blog posts, announcements, events, and gallery items shown on the public school website.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-2 border-b border-gray-100 p-3 sm:flex sm:flex-wrap sm:gap-2 sm:p-4 dark:border-gray-800">
          {WEBSITE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-11 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors touch-manipulation sm:px-4 ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary active:bg-primary/15 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4">
          {(activeTab === 'blog' || activeTab === 'announcements') && (
            <ContentTabPanel
              tabKey={activeTab}
              category={currentTab.category}
              api={websiteBlogApi}
              queryKey={['website-content', 'blog', currentTab.category]}
              getRowId={(row) => row.slug}
              buildPayload={(values, uploadedFile, cat) => buildBlogFormData(values, uploadedFile, cat)}
              validateBeforeSubmit={(values) => {
                if (!values.excerpt?.trim() && !values.content?.trim()) {
                  toast.error('Add a summary or full content.');
                  return true;
                }
                return false;
              }}
              defaultValues={{
                title: '',
                excerpt: '',
                content: '',
                author_name: '',
                tags: '',
                is_published: true,
              }}
              columns={[
                { key: 'title', header: 'Title', render: (r) => <span className="font-semibold">{r.title}</span> },
                { key: 'author_name', header: 'Author', render: (r) => r.author_name || '—' },
                { key: 'published_at', header: 'Date', render: (r) => formatDate(r.published_at || r.created_at) },
              ]}
              renderForm={({ register, file, setFile, editing }) => (
                <>
                  <Input label="Title" {...register('title', { required: true })} />
                  <Input label="Author" placeholder="Biruk Academy" {...register('author_name')} />
                  <Textarea label="Summary" rows={3} placeholder="Short summary shown on the website" {...register('excerpt')} />
                  <Textarea label="Full content" rows={5} placeholder="Optional longer article text" {...register('content')} />
                  <Input label="Tags" placeholder="news, community" {...register('tags')} />
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm touch-manipulation">
                    <input type="checkbox" {...register('is_published')} className="h-4 w-4 rounded border-gray-300" />
                    Publish on website
                  </label>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Featured image {editing ? '(optional)' : '(optional)'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-primary"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && <p className="mt-2 text-xs text-gray-500">{file.name}</p>}
                  </div>
                </>
              )}
            />
          )}

          {activeTab === 'events' && (
            <ContentTabPanel
              tabKey="events"
              api={websiteEventsApi}
              queryKey={['website-content', 'events']}
              getRowId={(row) => row.id}
              buildPayload={(values, uploadedFile) => buildEventFormData(values, uploadedFile)}
              validateBeforeSubmit={(values) => {
                if (!values.description?.trim()) {
                  toast.error('Description is required.');
                  return true;
                }
                if (!values.start_date) {
                  toast.error('Start date and time are required.');
                  return true;
                }
                return false;
              }}
              defaultValues={{
                title: '',
                description: '',
                location: '',
                start_date: '',
                end_date: '',
                is_published: true,
              }}
              columns={[
                { key: 'title', header: 'Event', render: (r) => <span className="font-semibold">{r.title}</span> },
                { key: 'start_date', header: 'Starts', render: (r) => formatDate(r.start_date) },
                { key: 'location', header: 'Location', render: (r) => r.location || '—' },
              ]}
              renderForm={({ register, file, setFile }) => (
                <>
                  <Input label="Title" {...register('title', { required: true })} />
                  <Textarea label="Description" rows={4} {...register('description', { required: true })} />
                  <Input label="Location" {...register('location')} />
                  <Input label="Start date & time" type="datetime-local" {...register('start_date', { required: true })} />
                  <Input label="End date & time" type="datetime-local" {...register('end_date')} />
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm touch-manipulation">
                    <input type="checkbox" {...register('is_published')} className="h-4 w-4 rounded border-gray-300" />
                    Publish on website
                  </label>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Event image (optional)</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-primary"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && <p className="mt-2 text-xs text-gray-500">{file.name}</p>}
                  </div>
                </>
              )}
            />
          )}

          {activeTab === 'gallery' && (
            <ContentTabPanel
              tabKey="gallery"
              api={websiteGalleryApi}
              queryKey={['website-content', 'gallery']}
              getRowId={(row) => row.id}
              requireFileOnCreate
              buildPayload={(values, uploadedFile) => buildGalleryFormData(values, uploadedFile)}
              defaultValues={{
                title: '',
                description: '',
                category: 'school_life',
                order: 0,
                is_published: true,
              }}
              columns={[
                { key: 'title', header: 'Title', render: (r) => <span className="font-semibold">{r.title}</span> },
                { key: 'category', header: 'Category', render: (r) => r.category || 'general' },
                { key: 'order', header: 'Order', render: (r) => r.order ?? 0 },
              ]}
              renderForm={({ register, file, setFile, editing }) => (
                <>
                  <Input label="Title" {...register('title', { required: true })} />
                  <Textarea label="Description" rows={3} {...register('description')} />
                  <Select
                    label="Category"
                    options={GALLERY_CATEGORY_OPTIONS}
                    {...register('category')}
                  />
                  <Input label="Display order" type="number" min="0" {...register('order')} />
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm touch-manipulation">
                    <input type="checkbox" {...register('is_published')} className="h-4 w-4 rounded border-gray-300" />
                    Publish on website
                  </label>
                  <div>
                    <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Image {editing ? '(leave empty to keep current)' : '(required)'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-primary"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && <p className="mt-2 text-xs text-gray-500">{file.name}</p>}
                  </div>
                </>
              )}
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Public pages"
          subtitle="Changes appear on the school website after publishing."
        />
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li>Blog and announcements → News & Events page</li>
          <li>Upcoming events → News & Events page (Events tab)</li>
          <li>Gallery → Gallery page</li>
        </ul>
      </Card>
    </div>
  );
}
