// FILE PATH: admin-panel/src/pages/sections/SectionDnD.tsx
// ACTION: Create this NEW file

import { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DraggableProduct } from '@/components/sections/DraggableProduct';
import {
  getSectionForDnD,
  reorderProducts,
  togglePinProduct,
  toggleFeatureProduct,
  removeProductFromSection,
  type OrderedProduct,
} from '@/services/sectionApi';
import api from '@/services/api';

export const SectionDnD = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ===================================
  // STATE
  // ===================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sectionName, setSectionName] = useState('');
  const [minProducts, setMinProducts] = useState(5);
  const [products, setProducts] = useState<OrderedProduct[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);

  // ===================================
  // LOAD SECTION DATA
  // ===================================
  useEffect(() => {
    loadSection();
  }, [id]);

  const loadSection = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getSectionForDnD(id);

      setSectionName(response.data.sectionName.en);
      setMinProducts(response.data.minProducts);

      // Populate product details
      const productIds = response.data.products.map(p => p.productId);
      const productDetails = await api.get('/products', {
        params: { ids: productIds.join(',') },
      });

      const productsWithDetails = response.data.products.map(item => ({
        ...item,
        product: productDetails.data.data.find(
          (p: any) => p._id === item.productId
        ),
      }));

      setProducts(productsWithDetails);
      setOriginalOrder(productIds);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // DRAG & DROP HANDLERS
  // ===================================
  const moveProduct = useCallback((dragIndex: number, hoverIndex: number) => {
    setProducts((prevProducts) => {
      const newProducts = [...prevProducts];
      const [removed] = newProducts.splice(dragIndex, 1);
      newProducts.splice(hoverIndex, 0, removed);

      // Update positions
      return newProducts.map((p, idx) => ({
        ...p,
        position: idx,
      }));
    });

    setHasChanges(true);
    setSuccess(null);
  }, []);

  const handleTogglePin = async (productId: string) => {
    if (!id) return;

    try {
      await togglePinProduct(id, productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId ? { ...p, isPinned: !p.isPinned } : p
        )
      );

      setSuccess('Pin status updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle pin');
    }
  };

  const handleToggleFeature = async (productId: string) => {
    if (!id) return;

    try {
      await toggleFeatureProduct(id, productId);

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? { ...p, isFeatured: !p.isFeatured }
            : p
        )
      );

      setSuccess('Feature status updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle feature');
    }
  };

  const handleRemove = async (productId: string) => {
    if (!id) return;
    if (products.length <= minProducts) {
      setError(`Cannot remove. Section must have at least ${minProducts} products`);
      return;
    }

    if (!confirm('Remove this product from the section?')) return;

    try {
      await removeProductFromSection(id, productId);

      setProducts((prev) =>
        prev
          .filter((p) => p.productId !== productId)
          .map((p, idx) => ({ ...p, position: idx }))
      );

      setHasChanges(true);
      setSuccess('Product removed');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove product');
    }
  };

  // ===================================
  // SAVE CHANGES
  // ===================================
  const handleSave = async () => {
    if (!id || !hasChanges) return;

    setSaving(true);
    setError(null);

    try {
      const newOrder = products.map((p) => p.productId);
      await reorderProducts(id, newOrder);

      setOriginalOrder(newOrder);
      setHasChanges(false);
      setSuccess('Order saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('Discard changes?')) return;
    navigate('/sections');
  };

  // ===================================
  // RENDER
  // ===================================
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Arrange Products</h2>
            <p className="text-muted-foreground">{sectionName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save!
          </AlertDescription>
        </Alert>
      )}

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({products.length}/{minProducts} minimum)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-3">
              {products.map((item, index) => (
                <DraggableProduct
                  key={item.productId}
                  productId={item.productId}
                  index={index}
                  product={item.product}
                  isPinned={item.isPinned}
                  isFeatured={item.isFeatured}
                  onMove={moveProduct}
                  onTogglePin={handleTogglePin}
                  onToggleFeature={handleToggleFeature}
                  onRemove={handleRemove}
                  disabled={saving}
                />
              ))}
            </div>
          </DndProvider>

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products in this section
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Drag & Drop:</strong> Click and hold the grip icon to reorder products</p>
          <p>• <strong>Pin:</strong> Keep products at the top of the section</p>
          <p>• <strong>Feature:</strong> Mark products for special highlighting</p>
          <p>• <strong>Remove:</strong> Delete products from the section (minimum {minProducts} required)</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionDnD;