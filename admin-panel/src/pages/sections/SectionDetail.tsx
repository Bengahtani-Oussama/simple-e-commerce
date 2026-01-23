// admin-panel/src/pages/sections/SectionDetail.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Pin,
  Star,
  GripVertical,
  Trash2,
  Package,
  Calendar,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/services/api';
import { formatDateTime, formatPrice, getImageUrl } from '@/utils';

interface ProductPriorityItem {
  _id?: string;
  product: {
    _id: string;
    name: { en: string; ar: string; fr: string };
    images: string[];
    basePrice: number;
  };
  position: number;
  isPinned: boolean;
  isFeatured: boolean;
  customNote?: string;
}

const SectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState<any>(null);
  const [products, setProducts] = useState<ProductPriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchSection();
    fetchPriorities();
  }, [id]);

  const fetchSection = async () => {
    try {
      const response = await api.get(`/sections/${id}`);
      setSection(response.data.data);
    } catch (error) {
      console.error('Failed to fetch section:', error);
      navigate('/sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await api.get(`/sections/${id}/priorities`);
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Failed to fetch priorities:', error);
    }
  };

  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newProducts = [...products];
    const draggedItem = newProducts[draggedIndex];
    
    newProducts.splice(draggedIndex, 1);
    newProducts.splice(index, 0, draggedItem);
    
    setProducts(newProducts);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      const productOrder = products.map((item, index) => ({
        productId: item.product._id,
        position: index,
      }));

      await api.put(`/sections/${id}/priorities/reorder`, { productOrder });
      await fetchPriorities();
    } catch (error) {
      console.error('Failed to reorder:', error);
      alert('Failed to save new order');
    }
    
    setDraggedIndex(null);
  };

  const togglePin = async (productId: string) => {
    try {
      await api.put(`/sections/${id}/priorities/${productId}/pin`);
      await fetchPriorities();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const toggleFeature = async (productId: string) => {
    try {
      await api.put(`/sections/${id}/priorities/${productId}/feature`);
      await fetchPriorities();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const saveNote = async (productId: string) => {
    try {
      await api.put(`/sections/${id}/priorities/${productId}`, {
        customNote: noteText,
      });
      setEditingNote(null);
      await fetchPriorities();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const removeProduct = async (productId: string) => {
    if (!confirm('Remove this product from the section?')) return;

    try {
      await api.delete(`/sections/${id}/products/${productId}`);
      await fetchPriorities();
      await fetchSection();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading section...</p>
        </div>
      </div>
    );
  }

  if (!section) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sections')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{section.name.en}</h2>
            <p className="text-muted-foreground">{section.name.ar}</p>
          </div>
          <Badge variant={section.isActive ? 'default' : 'secondary'}>
            {section.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <Button onClick={() => navigate(`/sections/edit/${id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Section
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm font-medium text-muted-foreground">Total Products</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length} / {section.minProducts} min
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm font-medium text-muted-foreground">Display Order</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{section.order}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm font-medium text-muted-foreground">Created</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDateTime(section.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      {section.scheduling.enabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Scheduling</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {section.scheduling.startDate && (
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm">{formatDateTime(section.scheduling.startDate)}</p>
                </div>
              )}
              {section.scheduling.endDate && (
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm">{formatDateTime(section.scheduling.endDate)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products ({products.length})</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                <Pin className="h-3 w-3 mr-1" />
                Pinned: {products.filter((p) => p.isPinned).length}
              </Badge>
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                Featured: {products.filter((p) => p.isFeatured).length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.length > 0 ? (
              products.map((item, index) => {
                const productId = item.product._id;

                return (
                  <div
                    key={productId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      border rounded-lg p-4 transition-all cursor-move
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${item.isPinned ? 'border-blue-500 bg-blue-50/50' : ''}
                      ${item.isFeatured ? 'bg-yellow-50/50' : ''}
                      hover:shadow-md
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>

                      <img
                        src={getImageUrl(item.product.images?.[0])}
                        alt={item.product.name.en}
                        className="h-16 w-16 object-cover rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium truncate">{item.product.name.en}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.product.basePrice)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {item.isPinned && (
                              <Badge variant="default" className="gap-1">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </Badge>
                            )}
                            {item.isFeatured && (
                              <Badge variant="secondary" className="gap-1">
                                <Star className="h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>

                        {editingNote === productId ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add admin note..."
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveNote(productId)}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNote(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : item.customNote ? (
                          <p
                            className="text-sm text-muted-foreground mt-2 cursor-pointer hover:text-foreground"
                            onClick={() => {
                              setEditingNote(productId);
                              setNoteText(item.customNote || '');
                            }}
                          >
                            📝 {item.customNote}
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 h-6 text-xs"
                            onClick={() => {
                              setEditingNote(productId);
                              setNoteText('');
                            }}
                          >
                            + Add note
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant={item.isPinned ? 'default' : 'outline'}
                          onClick={() => togglePin(productId)}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={item.isFeatured ? 'default' : 'outline'}
                          onClick={() => toggleFeature(productId)}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProduct(productId)}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No products in this section</p>
                <Button
                  variant="link"
                  onClick={() => navigate(`/sections/edit/${id}`)}
                  className="mt-2"
                >
                  Add Products
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">💡 Product Priority Tips</div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• <strong>Drag & Drop:</strong> Reorder products by dragging them up or down</p>
          <p>• <strong>Pin:</strong> Keep important products at the top (they always show first)</p>
          <p>• <strong>Feature:</strong> Highlight special products with a badge</p>
          <p>• <strong>Notes:</strong> Add internal notes to track why products are positioned</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionDetail;